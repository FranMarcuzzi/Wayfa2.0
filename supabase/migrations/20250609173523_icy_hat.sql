-- Function to increment poll votes
CREATE OR REPLACE FUNCTION increment_poll_votes(option_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE poll_options 
  SET votes = votes + 1 
  WHERE id = option_id;
END;
$$;

-- Function to handle invitation acceptance and auto-join
CREATE OR REPLACE FUNCTION handle_invitation_acceptance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists and invitation is for them
  IF NEW.accepted_at IS NOT NULL AND OLD.accepted_at IS NULL THEN
    -- Get user by email
    DECLARE
      user_id uuid;
    BEGIN
      SELECT id INTO user_id 
      FROM users 
      WHERE email = NEW.email;
      
      -- If user exists, add them as participant
      IF user_id IS NOT NULL THEN
        INSERT INTO trip_participants (trip_id, user_id, role)
        VALUES (NEW.trip_id, user_id, NEW.role)
        ON CONFLICT (trip_id, user_id) DO NOTHING;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for invitation acceptance
DROP TRIGGER IF EXISTS on_invitation_accepted ON invitations;
CREATE TRIGGER on_invitation_accepted
  AFTER UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION handle_invitation_acceptance();

-- Function to auto-accept invitations when user signs up
CREATE OR REPLACE FUNCTION auto_accept_invitations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Accept any pending invitations for this email
  UPDATE invitations 
  SET accepted_at = now()
  WHERE email = NEW.email 
    AND accepted_at IS NULL 
    AND expires_at > now();
    
  -- Add user to trips they were invited to
  INSERT INTO trip_participants (trip_id, user_id, role)
  SELECT trip_id, NEW.id, role
  FROM invitations 
  WHERE email = NEW.email 
    AND accepted_at IS NOT NULL
    AND expires_at > now()
  ON CONFLICT (trip_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger for auto-accepting invitations on user creation
DROP TRIGGER IF EXISTS on_user_created_accept_invitations ON users;
CREATE TRIGGER on_user_created_accept_invitations
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_accept_invitations();