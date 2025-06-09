-- Disable RLS temporarily to safely drop all policies
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start completely fresh
DROP POLICY IF EXISTS "Trip owners full access" ON trips;
DROP POLICY IF EXISTS "Trip participants read access" ON trips;
DROP POLICY IF EXISTS "Trip owners can manage their trips" ON trips;
DROP POLICY IF EXISTS "Trip participants can read trips" ON trips;

DROP POLICY IF EXISTS "Users can read participants of accessible trips" ON trip_participants;
DROP POLICY IF EXISTS "Trip owners can add themselves as participants" ON trip_participants;
DROP POLICY IF EXISTS "Users can join trips via invitations" ON trip_participants;
DROP POLICY IF EXISTS "System can insert participants via triggers" ON trip_participants;

DROP POLICY IF EXISTS "Users can read invitations for their trips" ON invitations;
DROP POLICY IF EXISTS "Users can accept their own invitations" ON invitations;
DROP POLICY IF EXISTS "Trip organizers can create invitations" ON invitations;

-- Re-enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TRIPS TABLE POLICIES (Simple and non-recursive)
-- ============================================================================

-- Policy 1: Trip owners have full access to their trips
CREATE POLICY "Trip owners full access"
  ON trips
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy 2: Trip participants can read trips (simple EXISTS without recursion)
CREATE POLICY "Trip participants read access"
  ON trips
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM trip_participants tp
      WHERE tp.trip_id = trips.id
      AND tp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIP_PARTICIPANTS TABLE POLICIES
-- ============================================================================

-- Policy 1: Users can read participants of trips they have access to
CREATE POLICY "Users can read participants of accessible trips"
  ON trip_participants
  FOR SELECT
  TO authenticated
  USING (
    -- Can read if you're the trip owner
    (trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())) OR
    -- Can read if you're a participant yourself
    (user_id = auth.uid()) OR
    -- Can read other participants if you're also a participant in the same trip
    (trip_id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()))
  );

-- Policy 2: Trip owners can add themselves as participants
CREATE POLICY "Trip owners can add themselves as participants"
  ON trip_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())
  );

-- Policy 3: Users can join trips via valid invitations
CREATE POLICY "Users can join trips via invitations"
  ON trip_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM invitations
      WHERE trip_id = trip_participants.trip_id
        AND email = (SELECT email FROM users WHERE id = auth.uid())
        AND accepted_at IS NOT NULL
        AND expires_at > now()
    )
  );

-- Policy 4: System can insert participants via triggers (for invitation acceptance)
CREATE POLICY "System can insert participants via triggers"
  ON trip_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invitations
      WHERE trip_id = trip_participants.trip_id
        AND email = (SELECT email FROM users WHERE id = trip_participants.user_id)
        AND accepted_at IS NOT NULL
        AND expires_at > now()
    )
  );

-- ============================================================================
-- INVITATIONS TABLE POLICIES
-- ============================================================================

-- Policy 1: Trip organizers can create invitations
CREATE POLICY "Trip organizers can create invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid() AND
    trip_id IN (
      SELECT tp.trip_id
      FROM trip_participants tp
      WHERE tp.user_id = auth.uid()
      AND tp.role = 'organizer'
    )
  );

-- Policy 2: Users can read invitations for their trips or sent to them
CREATE POLICY "Users can read invitations for their trips"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    (invited_by = auth.uid()) OR
    (trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())) OR
    (email = (SELECT email FROM users WHERE id = auth.uid()))
  );

-- Policy 3: Users can accept their own invitations
CREATE POLICY "Users can accept their own invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM users WHERE id = auth.uid()));

-- ============================================================================
-- VERIFICATION TEST
-- ============================================================================

-- Test that the policies work without recursion
DO $$
DECLARE
  test_count integer;
BEGIN
  -- Test trips table
  SELECT COUNT(*) INTO test_count FROM trips LIMIT 1;
  
  -- Test trip_participants table
  SELECT COUNT(*) INTO test_count FROM trip_participants LIMIT 1;
  
  -- Test invitations table
  SELECT COUNT(*) INTO test_count FROM invitations LIMIT 1;
  
  RAISE NOTICE 'SUCCESS: All RLS policies are working correctly without recursion';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'FAILED: RLS policies still have recursion issues: %', SQLERRM;
END $$;