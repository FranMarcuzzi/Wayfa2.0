/*
  # Fix RLS policies for trips table

  This migration fixes the infinite recursion issue in the trips table RLS policies
  by simplifying the policy logic and removing circular dependencies.

  ## Changes Made

  1. **Removed problematic policies**: Drop existing policies that cause recursion
  2. **Simplified policies**: Create new, straightforward policies without circular references
  3. **Security maintained**: Ensure users can only access trips they own or participate in

  ## New Policy Structure

  - Trip owners can perform all operations on their trips
  - Trip participants can read trips they're part of (checked via trip_participants table)
  - Separate policies for different operations to avoid complexity
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read trips they participate in" ON trips;
DROP POLICY IF EXISTS "Trip owners can update their trips" ON trips;
DROP POLICY IF EXISTS "Trip owners can delete their trips" ON trips;
DROP POLICY IF EXISTS "Users can create trips" ON trips;

-- Create simplified policies without recursion

-- Policy for trip owners to manage their own trips
CREATE POLICY "Trip owners can manage their trips"
  ON trips
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy for participants to read trips (using a function to avoid recursion)
CREATE OR REPLACE FUNCTION user_can_read_trip(trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_participants 
    WHERE trip_participants.trip_id = user_can_read_trip.trip_id 
    AND trip_participants.user_id = auth.uid()
  );
$$;

CREATE POLICY "Trip participants can read trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR user_can_read_trip(id)
  );