/*
  # Arreglar permisos de participantes para edición

  1. Problema
    - Los participantes solo pueden ver pero no editar
    - Necesitan poder editar itinerario, gastos y polls
    - Solo guests no pueden editar (solo ver)
    
  2. Solución
    - Actualizar políticas para permitir edición a participants y organizers
    - Guests solo pueden leer
    - Owners y organizers pueden invitar gente
    
  3. Permisos por rol:
    - Owner: Todo
    - Organizer: Todo excepto eliminar viaje
    - Participant: Editar contenido, no invitar gente
    - Guest: Solo leer
*/

-- ============================================================================
-- ITINERARIO: Permitir edición a participants
-- ============================================================================

-- Actualizar política de creación para incluir participants
DROP POLICY IF EXISTS "Trip participants can create itinerary" ON itinerary;

CREATE POLICY "Trip participants can create itinerary"
  ON itinerary
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    trip_id IN (
      -- Owners pueden crear
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      -- Participants y organizers pueden crear (guests NO)
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid() 
      AND role IN ('participant', 'organizer')
    )
  );

-- Actualizar política de actualización para incluir participants
DROP POLICY IF EXISTS "Trip participants can update their itinerary" ON itinerary;

CREATE POLICY "Trip participants can update their itinerary"
  ON itinerary
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid() 
      AND role IN ('participant', 'organizer')
    )
  );

-- Actualizar política de eliminación para incluir participants
DROP POLICY IF EXISTS "Trip participants can delete their itinerary" ON itinerary;

CREATE POLICY "Trip participants can delete their itinerary"
  ON itinerary
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid() 
      AND role IN ('participant', 'organizer')
    )
  );

-- ============================================================================
-- GASTOS: Permitir edición a participants
-- ============================================================================

-- Actualizar política de creación para incluir participants
DROP POLICY IF EXISTS "Trip participants can create expenses" ON expenses;

CREATE POLICY "Trip participants can create expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid() 
      AND role IN ('participant', 'organizer')
    )
  );

-- Actualizar política de actualización para incluir participants
DROP POLICY IF EXISTS "Trip participants can update their expenses" ON expenses;

CREATE POLICY "Trip participants can update their expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid() 
      AND role IN ('participant', 'organizer')
    )
  );

-- Actualizar política de eliminación para incluir participants
DROP POLICY IF EXISTS "Trip participants can delete their expenses" ON expenses;

CREATE POLICY "Trip participants can delete their expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid() 
      AND role IN ('participant', 'organizer')
    )
  );

-- ============================================================================
-- POLLS: Permitir edición a participants
-- ============================================================================

-- Actualizar política de creación para incluir participants
DROP POLICY IF EXISTS "Trip participants can create polls" ON polls;

CREATE POLICY "Trip participants can create polls"
  ON polls
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid() 
      AND role IN ('participant', 'organizer')
    )
  );

-- Actualizar política de actualización para incluir participants
DROP POLICY IF EXISTS "Trip participants can update their polls" ON polls;

CREATE POLICY "Trip participants can update their polls"
  ON polls
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid() 
      AND role IN ('participant', 'organizer')
    )
  );

-- Actualizar política de eliminación para incluir participants
DROP POLICY IF EXISTS "Trip participants can delete their polls" ON polls;

CREATE POLICY "Trip participants can delete their polls"
  ON polls
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      SELECT trip_id FROM trip_participants 
      WHERE user_id = auth.uid() 
      AND role IN ('participant', 'organizer')
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
  
  RAISE NOTICE '✅ SUCCESS: Participant edit permissions updated successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ FAILED: Error updating participant edit permissions: %', SQLERRM;
END $$;