/*
  # Fix invitation system and dependencies

  1. Drop dependent policies first
  2. Drop and recreate functions
  3. Recreate policies with proper permissions
  4. Add triggers for invitation handling
*/

-- First, drop all policies that might depend on functions
DROP POLICY IF EXISTS "Trip participants can read trips" ON trips;
DROP POLICY IF EXISTS "Users can read invitations for their trips" ON invitations;
DROP POLICY IF EXISTS "Users can accept their own invitations" ON invitations;
DROP POLICY IF EXISTS "Users can read participants of accessible trips" ON trip_participants;
DROP POLICY IF EXISTS "System can insert participants via invitations" ON trip_participants;
DROP POLICY IF EXISTS "Users can join trips via invitations" ON trip_participants;
DROP POLICY IF EXISTS "Users can read participants of their trips" ON trip_participants;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_invitation_accepted ON invitations;
DROP TRIGGER IF EXISTS on_user_created_accept_invitations ON users;

-- Now drop functions safely
DROP FUNCTION IF EXISTS user_can_read_trip(uuid);
DROP FUNCTION IF EXISTS handle_invitation_acceptance();
DROP FUNCTION IF EXISTS auto_accept_invitations();
DROP FUNCTION IF EXISTS increment_poll_votes(uuid);

-- Create the user_can_read_trip function
CREATE OR REPLACE FUNCTION user_can_read_trip(trip_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if user is a participant in the trip
  RETURN EXISTS (
    SELECT 1 FROM trip_participants 
    WHERE trip_id = trip_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle invitation acceptance
CREATE OR REPLACE FUNCTION handle_invitation_acceptance()
RETURNS trigger AS $$
DECLARE
  user_id_var uuid;
BEGIN
  -- Only proceed if accepted_at was just set (not null) and wasn't set before
  IF NEW.accepted_at IS NOT NULL AND (OLD.accepted_at IS NULL OR OLD.accepted_at != NEW.accepted_at) THEN
    -- Find the user by email
    SELECT id INTO user_id_var 
    FROM users 
    WHERE email = NEW.email;
    
    -- If user exists, add them as participant
    IF user_id_var IS NOT NULL THEN
      INSERT INTO trip_participants (trip_id, user_id, role)
      VALUES (NEW.trip_id, user_id_var, NEW.role)
      ON CONFLICT (trip_id, user_id) DO NOTHING;
      
      -- Create notification for successful join
      INSERT INTO notifications (user_id, title, message, type, trip_id)
      VALUES (
        user_id_var,
        'Welcome to the trip!',
        'You have successfully joined the trip',
        'system',
        NEW.trip_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-accept invitations when user signs up
CREATE OR REPLACE FUNCTION auto_accept_invitations()
RETURNS trigger AS $$
BEGIN
  -- Auto-accept any pending invitations for this email
  UPDATE invitations 
  SET accepted_at = now()
  WHERE email = NEW.email 
    AND accepted_at IS NULL 
    AND expires_at > now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment poll votes
CREATE OR REPLACE FUNCTION increment_poll_votes(option_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE poll_options 
  SET votes = votes + 1 
  WHERE id = option_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_invitation_accepted
  AFTER UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION handle_invitation_acceptance();

CREATE TRIGGER on_user_created_accept_invitations
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_accept_invitations();

-- Recreate trip policies
CREATE POLICY "Trip participants can read trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING ((owner_id = auth.uid()) OR user_can_read_trip(id));

-- Create invitation policies
CREATE POLICY "Users can read invitations for their trips"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    (invited_by = auth.uid()) OR 
    (trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())) OR
    (email = (SELECT email FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Users can accept their own invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM users WHERE id = auth.uid()));

-- Create trip participants policies
CREATE POLICY "Users can read participants of accessible trips"
  ON trip_participants
  FOR SELECT
  TO authenticated
  USING (
    (trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())) OR
    (user_id = auth.uid()) OR
    (trip_id IN (SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can join trips via invitations"
  ON trip_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy for automatic participant insertion via triggers
CREATE POLICY "System can insert participants via invitations"
  ON trip_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid()) OR
    -- Allow insertion if there's a valid accepted invitation
    EXISTS (
      SELECT 1 FROM invitations 
      WHERE trip_id = trip_participants.trip_id 
        AND email = (SELECT email FROM users WHERE id = trip_participants.user_id)
        AND accepted_at IS NOT NULL
        AND expires_at > now()
    )
  );