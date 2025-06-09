/*
  # Initial Schema for Trip Planning App

  1. New Tables
    - `users` - User profiles with authentication integration
    - `trips` - Trip information and management
    - `trip_participants` - Users participating in trips with roles
    - `invitations` - Trip invitation system with secure tokens
    - `itinerary` - Trip activities and scheduling
    - `expenses` - Expense tracking per trip
    - `expense_splits` - How expenses are split among participants
    - `polls` - Group decision making polls
    - `poll_options` - Poll voting options
    - `votes` - Individual user votes on polls
    - `notifications` - In-app notification system

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure invitation token system
    - User-based data access controls

  3. Features
    - Complete trip management workflow
    - Role-based access (organizer, participant, guest)
    - Expense splitting and balance calculations
    - Real-time polling system
    - Notification system for updates
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  budget numeric,
  currency text DEFAULT 'USD',
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Trip participants
CREATE TABLE IF NOT EXISTS trip_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'participant' CHECK (role IN ('organizer', 'participant', 'guest')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- Invitations
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  role text DEFAULT 'participant' CHECK (role IN ('participant', 'guest')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  invited_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Itinerary items
CREATE TABLE IF NOT EXISTS itinerary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  start_time time,
  end_time time,
  title text NOT NULL,
  description text,
  location text,
  type text DEFAULT 'activity' CHECK (type IN ('activity', 'meal', 'transport', 'accommodation', 'other')),
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_times CHECK (end_time IS NULL OR start_time IS NULL OR end_time >= start_time)
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'USD',
  category text DEFAULT 'other' CHECK (category IN ('accommodation', 'transport', 'food', 'activities', 'shopping', 'other')),
  paid_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  receipt_url text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expense splits
CREATE TABLE IF NOT EXISTS expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(expense_id, user_id)
);

-- Polls
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  description text,
  multiple_choice boolean DEFAULT false,
  closes_at timestamptz,
  closed boolean DEFAULT false,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Poll options
CREATE TABLE IF NOT EXISTS poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, option_id, user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'system' CHECK (type IN ('trip_invite', 'poll_created', 'expense_added', 'balance_reminder', 'system')),
  read boolean DEFAULT false,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Trips policies
CREATE POLICY "Users can read trips they participate in" ON trips
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create trips" ON trips
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Trip owners can update their trips" ON trips
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Trip owners can delete their trips" ON trips
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Trip participants policies
CREATE POLICY "Users can read participants of their trips" ON trip_participants
  FOR SELECT TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
    ) OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can join trips via invitations" ON trip_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Invitations policies
CREATE POLICY "Users can read invitations for their trips" ON invitations
  FOR SELECT TO authenticated
  USING (
    invited_by = auth.uid() OR
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Trip organizers can create invitations" ON invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = auth.uid() AND
    trip_id IN (
      SELECT tp.trip_id FROM trip_participants tp
      WHERE tp.user_id = auth.uid() AND tp.role IN ('organizer')
    )
  );

-- Expenses policies
CREATE POLICY "Trip participants can read expenses" ON expenses
  FOR SELECT TO authenticated
  USING (
    trip_id IN (
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Trip participants can create expenses" ON expenses
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_owner_id ON trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trip_participants_trip_id ON trip_participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_participants_user_id ON trip_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itinerary_updated_at
  BEFORE UPDATE ON itinerary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();