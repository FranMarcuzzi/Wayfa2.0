export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
};

export type Trip = {
  id: string;
  title: string;
  description: string | null;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number | null;
  currency: string;
  owner_id: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  participants?: TripParticipant[];
  owner?: User;
};

export type TripParticipant = {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'organizer' | 'participant' | 'guest';
  joined_at: string;
  user?: User;
};

export type Invitation = {
  id: string;
  trip_id: string;
  email: string;
  token: string;
  role: 'participant' | 'guest';
  expires_at: string;
  accepted_at: string | null;
  invited_by: string;
  created_at: string;
  trip?: Trip;
  inviter?: User;
};

export type ItineraryItem = {
  id: string;
  trip_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  type: 'activity' | 'meal' | 'transport' | 'accommodation' | 'other';
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: User;
};

export type Expense = {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: 'accommodation' | 'transport' | 'food' | 'activities' | 'shopping' | 'other';
  paid_by: string;
  receipt_url: string | null;
  date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  payer?: User;
  creator?: User;
  splits?: ExpenseSplit[];
};

export type ExpenseSplit = {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  paid: boolean;
  created_at: string;
  user?: User;
};

export type Poll = {
  id: string;
  trip_id: string;
  question: string;
  description: string | null;
  multiple_choice: boolean;
  closes_at: string | null;
  closed: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: User;
  options?: PollOption[];
  user_votes?: Vote[];
};

export type PollOption = {
  id: string;
  poll_id: string;
  text: string;
  votes: number;
  created_at: string;
};

export type Vote = {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
  option?: PollOption;
  user?: User;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'trip_invite' | 'poll_created' | 'expense_added' | 'balance_reminder' | 'system';
  read: boolean;
  trip_id: string | null;
  created_at: string;
  trip?: Trip;
};

export type Balance = {
  user_id: string;
  user?: User;
  owes: number;
  owed: number;
  net: number;
};