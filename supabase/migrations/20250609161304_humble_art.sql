/*
  # Add missing RLS policies for itinerary, polls, and notifications

  1. Security
    - Add RLS policies for itinerary table
    - Add RLS policies for polls and poll_options tables  
    - Add RLS policies for notifications table
    - Add RLS policies for expense_splits table

  2. Policies
    - Users can read/write itinerary items for trips they participate in
    - Users can read/write polls for trips they participate in
    - Users can read their own notifications
    - Users can read expense splits for trips they participate in
*/

-- Itinerary policies
CREATE POLICY "Trip participants can read itinerary"
  ON itinerary
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
      UNION
      SELECT id FROM trips WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Trip participants can create itinerary items"
  ON itinerary
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
      UNION
      SELECT id FROM trips WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Trip participants can update their itinerary items"
  ON itinerary
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
      UNION
      SELECT id FROM trips WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Trip participants can delete their itinerary items"
  ON itinerary
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
      UNION
      SELECT id FROM trips WHERE owner_id = auth.uid()
    )
  );

-- Polls policies
CREATE POLICY "Trip participants can read polls"
  ON polls
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
      UNION
      SELECT id FROM trips WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Trip participants can create polls"
  ON polls
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
      UNION
      SELECT id FROM trips WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Poll creators can update their polls"
  ON polls
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Poll creators can delete their polls"
  ON polls
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Poll options policies
CREATE POLICY "Trip participants can read poll options"
  ON poll_options
  FOR SELECT
  TO authenticated
  USING (
    poll_id IN (
      SELECT id FROM polls WHERE trip_id IN (
        SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
        UNION
        SELECT id FROM trips WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Poll creators can manage poll options"
  ON poll_options
  FOR ALL
  TO authenticated
  USING (
    poll_id IN (
      SELECT id FROM polls WHERE created_by = auth.uid()
    )
  );

-- Votes policies
CREATE POLICY "Trip participants can read votes"
  ON votes
  FOR SELECT
  TO authenticated
  USING (
    poll_id IN (
      SELECT id FROM polls WHERE trip_id IN (
        SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
        UNION
        SELECT id FROM trips WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their own votes"
  ON votes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Expense splits policies
CREATE POLICY "Trip participants can read expense splits"
  ON expense_splits
  FOR SELECT
  TO authenticated
  USING (
    expense_id IN (
      SELECT id FROM expenses WHERE trip_id IN (
        SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
        UNION
        SELECT id FROM trips WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Expense creators can manage splits"
  ON expense_splits
  FOR ALL
  TO authenticated
  USING (
    expense_id IN (
      SELECT id FROM expenses WHERE created_by = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);