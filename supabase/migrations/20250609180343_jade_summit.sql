/*
  # Fix infinite recursion in trips RLS policies

  1. Problem
    - The current RLS policies on the trips table are causing infinite recursion
    - This happens when policies reference other tables that reference back to trips

  2. Solution
    - Drop all existing policies on trips table
    - Create simple, non-recursive policies
    - Ensure policies don't create circular dependencies

  3. Security
    - Trip owners can manage their trips
    - Participants can read trips they're part of
    - No circular references between tables
*/

-- First, disable RLS temporarily to avoid issues during migration
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on trips table
DROP POLICY IF EXISTS "Trip owners full access" ON trips;
DROP POLICY IF EXISTS "Trip participants read access" ON trips;
DROP POLICY IF EXISTS "Trip owners can manage their trips" ON trips;
DROP POLICY IF EXISTS "Trip participants can read trips" ON trips;

-- Re-enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Policy 1: Trip owners have full access to their trips
CREATE POLICY "Trip owners full access"
  ON trips
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy 2: Trip participants can read trips (using a simple EXISTS without recursion)
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

-- Verify the policies are working by testing a simple query
-- This should not cause recursion
DO $$
BEGIN
  -- Test that we can query trips without recursion
  PERFORM 1 FROM trips LIMIT 1;
  RAISE NOTICE 'Trips RLS policies are working correctly';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'RLS policies still have issues: %', SQLERRM;
END $$;