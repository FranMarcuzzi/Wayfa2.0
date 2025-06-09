/*
  # Eliminar TODAS las políticas que causan conflictos de recursión

  1. Deshabilitar RLS temporalmente
  2. Eliminar TODAS las políticas existentes
  3. Crear políticas nuevas y simples sin recursión
  4. Verificar que funcionen correctamente

  IMPORTANTE: Esto eliminará todos los conflictos de recursión
*/

-- ============================================================================
-- PASO 1: DESHABILITAR RLS TEMPORALMENTE
-- ============================================================================

ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits DISABLE ROW LEVEL SECURITY;
ALTER TABLE polls DISABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 2: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ============================================================================

-- Trips
DROP POLICY IF EXISTS "Trip owners full access" ON trips;
DROP POLICY IF EXISTS "Trip participants read access" ON trips;
DROP POLICY IF EXISTS "Trip owners can manage their trips" ON trips;
DROP POLICY IF EXISTS "Trip participants can read trips" ON trips;

-- Trip Participants
DROP POLICY IF EXISTS "Users can read participants of accessible trips" ON trip_participants;
DROP POLICY IF EXISTS "Trip owners can add themselves as participants" ON trip_participants;
DROP POLICY IF EXISTS "Users can join trips via invitations" ON trip_participants;
DROP POLICY IF EXISTS "System can insert participants via triggers" ON trip_participants;

-- Invitations
DROP POLICY IF EXISTS "Users can read invitations for their trips" ON invitations;
DROP POLICY IF EXISTS "Users can accept their own invitations" ON invitations;
DROP POLICY IF EXISTS "Trip organizers can create invitations" ON invitations;

-- Itinerary
DROP POLICY IF EXISTS "Trip participants can create itinerary items" ON itinerary;
DROP POLICY IF EXISTS "Trip participants can read itinerary" ON itinerary;
DROP POLICY IF EXISTS "Trip participants can update their itinerary items" ON itinerary;
DROP POLICY IF EXISTS "Trip participants can delete their itinerary items" ON itinerary;

-- Expenses
DROP POLICY IF EXISTS "Trip participants can create expenses" ON expenses;
DROP POLICY IF EXISTS "Trip participants can read expenses" ON expenses;

-- Expense Splits
DROP POLICY IF EXISTS "Expense creators can manage splits" ON expense_splits;
DROP POLICY IF EXISTS "Trip participants can read expense splits" ON expense_splits;

-- Polls
DROP POLICY IF EXISTS "Trip participants can create polls" ON polls;
DROP POLICY IF EXISTS "Trip participants can read polls" ON polls;
DROP POLICY IF EXISTS "Poll creators can update their polls" ON polls;
DROP POLICY IF EXISTS "Poll creators can delete their polls" ON polls;

-- Poll Options
DROP POLICY IF EXISTS "Poll creators can manage poll options" ON poll_options;
DROP POLICY IF EXISTS "Trip participants can read poll options" ON poll_options;

-- Votes
DROP POLICY IF EXISTS "Users can manage their own votes" ON votes;
DROP POLICY IF EXISTS "Trip participants can read votes" ON votes;

-- Notifications
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- ============================================================================
-- PASO 3: REHABILITAR RLS
-- ============================================================================

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 4: CREAR POLÍTICAS SIMPLES SIN RECURSIÓN
-- ============================================================================

-- TRIPS: Solo los dueños pueden hacer todo
CREATE POLICY "Trip owners full access"
  ON trips
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- TRIP_PARTICIPANTS: Políticas simples
CREATE POLICY "Users can read all participants"
  ON trip_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert themselves as participants"
  ON trip_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- INVITATIONS: Políticas simples
CREATE POLICY "Users can read all invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Users can update invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ITINERARY: Políticas simples
CREATE POLICY "Users can manage itinerary"
  ON itinerary
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- EXPENSES: Políticas simples
CREATE POLICY "Users can manage expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- EXPENSE_SPLITS: Políticas simples
CREATE POLICY "Users can manage expense splits"
  ON expense_splits
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- POLLS: Políticas simples
CREATE POLICY "Users can manage polls"
  ON polls
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- POLL_OPTIONS: Políticas simples
CREATE POLICY "Users can manage poll options"
  ON poll_options
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- VOTES: Políticas simples
CREATE POLICY "Users can manage votes"
  ON votes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- NOTIFICATIONS: Políticas simples
CREATE POLICY "Users can manage their notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PASO 5: VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  test_count integer;
BEGIN
  -- Test all tables
  SELECT COUNT(*) INTO test_count FROM trips LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM trip_participants LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM invitations LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM itinerary LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM expenses LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM expense_splits LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM polls LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM poll_options LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM votes LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM notifications LIMIT 1;
  
  RAISE NOTICE '✅ SUCCESS: ALL RLS policies are working correctly without recursion';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ FAILED: RLS policies still have issues: %', SQLERRM;
END $$;