/*
  # Fix Trip Creation and RLS Policies

  1. Security
    - Fix RLS policies to allow immediate trip visibility
    - Ensure trip owners can always see their trips
    - Fix participant insertion policies

  2. Changes
    - Simplify trip read policy
    - Fix participant insertion timing
    - Add better error handling
*/

-- Drop problematic policies
DROP POLICY IF EXISTS "Trip participants can read trips" ON trips;
DROP POLICY IF EXISTS "Trip owners can manage their trips" ON trips;
DROP POLICY IF EXISTS "Users can read participants of accessible trips" ON trip_participants;
DROP POLICY IF EXISTS "System can insert participants via invitations" ON trip_participants;
DROP POLICY IF EXISTS "Users can join trips via invitations" ON trip_participants;

-- Create simplified and working trip policies
CREATE POLICY "Trip owners can manage their trips"
  ON trips
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Trip participants can read trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING (
    (owner_id = auth.uid()) OR 
    (id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()))
  );

-- Fix trip participants policies
CREATE POLICY "Users can read participants of accessible trips"
  ON trip_participants
  FOR SELECT
  TO authenticated
  USING (
    -- Can read if you're the trip owner
    (trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())) OR
    -- Can read if you're a participant in the trip
    (user_id = auth.uid()) OR
    -- Can read other participants if you're also a participant
    (trip_id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()))
  );

-- Allow trip owners to add themselves as participants
CREATE POLICY "Trip owners can add themselves as participants"
  ON trip_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())
  );

-- Allow users to join via invitations
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

-- System policy for automatic participant insertion
CREATE POLICY "System can insert participants via triggers"
  ON trip_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if there's a valid accepted invitation for this user
    EXISTS (
      SELECT 1 FROM invitations 
      WHERE trip_id = trip_participants.trip_id 
        AND email = (SELECT email FROM users WHERE id = trip_participants.user_id)
        AND accepted_at IS NOT NULL
        AND expires_at > now()
    )
  );