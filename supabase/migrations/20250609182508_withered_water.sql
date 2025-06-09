/*
  # Arreglar permisos para participantes del viaje

  1. Permisos de participantes
    - Los participantes pueden leer todo del viaje
    - Los participantes pueden crear/editar itinerario, gastos, polls
    - Solo organizadores pueden invitar gente
    
  2. Políticas actualizadas
    - Itinerario: participantes pueden crear/editar
    - Gastos: participantes pueden crear/editar
    - Polls: participantes pueden crear/editar
    - Invitaciones: solo organizadores
*/

-- ============================================================================
-- ITINERARIO: Participantes pueden crear/editar
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage itinerary" ON itinerary;

-- Participantes pueden leer itinerario de sus viajes
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

-- Participantes pueden crear itinerario en sus viajes
CREATE POLICY "Trip participants can create itinerary"
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

-- Participantes pueden editar su propio itinerario
CREATE POLICY "Trip participants can update their itinerary"
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

-- Participantes pueden eliminar su propio itinerario
CREATE POLICY "Trip participants can delete their itinerary"
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

-- ============================================================================
-- GASTOS: Participantes pueden crear/editar
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage expenses" ON expenses;

-- Participantes pueden leer gastos de sus viajes
CREATE POLICY "Trip participants can read expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
      UNION
      SELECT id FROM trips WHERE owner_id = auth.uid()
    )
  );

-- Participantes pueden crear gastos en sus viajes
CREATE POLICY "Trip participants can create expenses"
  ON expenses
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

-- Participantes pueden editar sus propios gastos
CREATE POLICY "Trip participants can update their expenses"
  ON expenses
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

-- Participantes pueden eliminar sus propios gastos
CREATE POLICY "Trip participants can delete their expenses"
  ON expenses
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

-- ============================================================================
-- POLLS: Participantes pueden crear/editar
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage polls" ON polls;

-- Participantes pueden leer polls de sus viajes
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

-- Participantes pueden crear polls en sus viajes
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

-- Participantes pueden editar sus propios polls
CREATE POLICY "Trip participants can update their polls"
  ON polls
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

-- Participantes pueden eliminar sus propios polls
CREATE POLICY "Trip participants can delete their polls"
  ON polls
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

-- ============================================================================
-- INVITACIONES: Solo organizadores pueden crear
-- ============================================================================

DROP POLICY IF EXISTS "Users can create invitations" ON invitations;

-- Solo organizadores y dueños pueden crear invitaciones
CREATE POLICY "Trip organizers can create invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid() AND
    (
      -- Es dueño del viaje
      trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid()) OR
      -- Es organizador del viaje
      trip_id IN (
        SELECT trip_id FROM trip_participants 
        WHERE user_id = auth.uid() AND role = 'organizer'
      )
    )
  );

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  test_count integer;
BEGIN
  -- Test all tables
  SELECT COUNT(*) INTO test_count FROM itinerary LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM expenses LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM polls LIMIT 1;
  SELECT COUNT(*) INTO test_count FROM invitations LIMIT 1;
  
  RAISE NOTICE '✅ SUCCESS: Participant permissions updated successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ FAILED: Error updating participant permissions: %', SQLERRM;
END $$;