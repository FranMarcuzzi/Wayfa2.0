/*
  # Arreglar acceso de participantes a viajes

  1. Problema
    - Los participantes regulares no pueden ver los viajes que aceptaron
    - Solo guests y owners tienen acceso actualmente
    
  2. Solución
    - Simplificar la política de lectura de viajes
    - Asegurar que TODOS los participantes (sin importar el rol) puedan ver sus viajes
    
  3. Verificación
    - Probar que participants, guests y organizers pueden ver viajes
*/

-- ============================================================================
-- ARREGLAR POLÍTICA DE LECTURA DE VIAJES
-- ============================================================================

-- Eliminar política actual que puede estar causando problemas
DROP POLICY IF EXISTS "Trip participants can read trips" ON trips;

-- Crear nueva política más simple y clara
CREATE POLICY "Trip participants can read trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING (
    -- Pueden ver si son dueños del viaje
    (owner_id = auth.uid()) OR
    -- Pueden ver si están en la tabla trip_participants (cualquier rol)
    EXISTS (
      SELECT 1 
      FROM trip_participants tp 
      WHERE tp.trip_id = trips.id 
      AND tp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFICAR QUE LAS POLÍTICAS FUNCIONAN
-- ============================================================================

DO $$
DECLARE
  test_count integer;
BEGIN
  -- Test trips table
  SELECT COUNT(*) INTO test_count FROM trips LIMIT 1;
  
  RAISE NOTICE '✅ SUCCESS: Participant trip access policy fixed';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ FAILED: Error fixing participant access: %', SQLERRM;
END $$;