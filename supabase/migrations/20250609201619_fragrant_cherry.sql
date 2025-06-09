/*
  # Create memories table for trip photos

  1. New Tables
    - `memories`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `user_id` (uuid, foreign key to users)
      - `title` (text, optional caption)
      - `description` (text, optional description)
      - `image_url` (text, photo URL)
      - `location` (text, optional location)
      - `taken_at` (timestamp, when photo was taken)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `memories` table
    - Add policies for trip participants to read memories
    - Add policies for trip participants to create/update/delete their own memories

  3. Indexes
    - Index on trip_id for efficient queries
    - Index on user_id for user-specific queries
    - Index on taken_at for chronological ordering
*/

CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text,
  description text,
  image_url text NOT NULL,
  location text,
  taken_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_memories_trip_id ON memories(trip_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_taken_at ON memories(taken_at DESC);

-- RLS Policies
CREATE POLICY "Trip participants can read memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT trip_participants.trip_id
      FROM trip_participants
      WHERE trip_participants.user_id = auth.uid()
      UNION
      SELECT trips.id
      FROM trips
      WHERE trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Trip participants can create memories"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    trip_id IN (
      SELECT trip_participants.trip_id
      FROM trip_participants
      WHERE trip_participants.user_id = auth.uid()
      UNION
      SELECT trips.id
      FROM trips
      WHERE trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own memories"
  ON memories
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own memories"
  ON memories
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_memories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_memories_updated_at();