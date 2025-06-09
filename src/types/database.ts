export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          destination: string;
          start_date: string;
          end_date: string;
          budget?: number | null;
          currency?: string;
          owner_id: string;
          status?: 'planning' | 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          destination?: string;
          start_date?: string;
          end_date?: string;
          budget?: number | null;
          currency?: string;
          owner_id?: string;
          status?: 'planning' | 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      trip_participants: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          role: 'organizer' | 'participant' | 'guest';
          joined_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          role?: 'organizer' | 'participant' | 'guest';
          joined_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string;
          role?: 'organizer' | 'participant' | 'guest';
          joined_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          trip_id: string;
          email: string;
          token: string;
          role: 'participant' | 'guest';
          expires_at: string;
          accepted_at: string | null;
          invited_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          email: string;
          token: string;
          role?: 'participant' | 'guest';
          expires_at: string;
          accepted_at?: string | null;
          invited_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          email?: string;
          token?: string;
          role?: 'participant' | 'guest';
          expires_at?: string;
          accepted_at?: string | null;
          invited_by?: string;
          created_at?: string;
        };
      };
      itinerary: {
        Row: {
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
        };
        Insert: {
          id?: string;
          trip_id: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          title: string;
          description?: string | null;
          location?: string | null;
          type?: 'activity' | 'meal' | 'transport' | 'accommodation' | 'other';
          order_index?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          title?: string;
          description?: string | null;
          location?: string | null;
          type?: 'activity' | 'meal' | 'transport' | 'accommodation' | 'other';
          order_index?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
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
        };
        Insert: {
          id?: string;
          trip_id: string;
          title: string;
          amount: number;
          currency?: string;
          category?: 'accommodation' | 'transport' | 'food' | 'activities' | 'shopping' | 'other';
          paid_by: string;
          receipt_url?: string | null;
          date: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          title?: string;
          amount?: number;
          currency?: string;
          category?: 'accommodation' | 'transport' | 'food' | 'activities' | 'shopping' | 'other';
          paid_by?: string;
          receipt_url?: string | null;
          date?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      expense_splits: {
        Row: {
          id: string;
          expense_id: string;
          user_id: string;
          amount: number;
          paid: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_id: string;
          user_id: string;
          amount: number;
          paid?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          expense_id?: string;
          user_id?: string;
          amount?: number;
          paid?: boolean;
          created_at?: string;
        };
      };
      polls: {
        Row: {
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
        };
        Insert: {
          id?: string;
          trip_id: string;
          question: string;
          description?: string | null;
          multiple_choice?: boolean;
          closes_at?: string | null;
          closed?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          question?: string;
          description?: string | null;
          multiple_choice?: boolean;
          closes_at?: string | null;
          closed?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          text: string;
          votes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          text: string;
          votes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          text?: string;
          votes?: number;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'trip_invite' | 'poll_created' | 'expense_added' | 'balance_reminder' | 'system';
          read: boolean;
          trip_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'trip_invite' | 'poll_created' | 'expense_added' | 'balance_reminder' | 'system';
          read?: boolean;
          trip_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'trip_invite' | 'poll_created' | 'expense_added' | 'balance_reminder' | 'system';
          read?: boolean;
          trip_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}