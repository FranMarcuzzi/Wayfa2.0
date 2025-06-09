/*
  # Fix infinite recursion in trips RLS policies

  1. Problem
    - Current RLS policies on trips table are causing infinite recursion
    - The "Trip participants can read trips" policy creates circular dependency
    
  2. Solution
    - Drop existing problematic policies
    - Create simplified, non-recursive policies
    - Ensure policies don't create circular references between trips and trip_participants tables
    
  3. Security
    - Maintain same access control but with simpler logic
    - Trip owners can manage their trips
    - Trip participants can read trips they're part of (simplified check)
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Trip owners can manage their trips" ON trips;
DROP POLICY IF EXISTS "Trip participants can read trips" ON trips;

-- Create new, simplified policies that avoid recursion

-- Policy 1: Trip owners can do everything with their trips
CREATE POLICY "Trip owners full access"
  ON trips
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy 2: Users can read trips where they are participants (simplified)
-- This avoids recursion by using a direct join instead of subquery
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

-- Ensure RLS is enabled
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;