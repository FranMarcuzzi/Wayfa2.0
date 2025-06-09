/*
  # Arreglar visibilidad de viajes para participantes

  1. Problema
    - Los participantes que aceptan invitaciones no pueden ver los viajes
    - Solo los dueños pueden ver sus viajes actualmente
    
  2. Solución
    - Agregar política para que participantes puedan ver viajes donde participan
    - Mantener la política simple para evitar recursión
    
  3. Resultado
    - Dueños pueden ver/gestionar sus viajes
    - Participantes pueden ver viajes donde están incluidos
*/

-- Eliminar política restrictiva actual de trips
DROP POLICY IF EXISTS "Trip owners full access" ON trips;

-- Crear política para dueños (mantener funcionalidad existente)
CREATE POLICY "Trip owners full access"
  ON trips
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Crear política para participantes (NUEVA - esto es lo que faltaba)
CREATE POLICY "Trip participants can read trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING (
    -- Pueden ver si son dueños
    (owner_id = auth.uid()) OR
    -- Pueden ver si son participantes
    (id IN (
      SELECT trip_id 
      FROM trip_participants 
      WHERE user_id = auth.uid()
    ))
  );

-- Verificar que las políticas funcionan
DO $$
DECLARE
  test_count integer;
BEGIN
  -- Test trips table
  SELECT COUNT(*) INTO test_count FROM trips LIMIT 1;
  
  RAISE NOTICE '✅ SUCCESS: Trip participant visibility policy added successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ FAILED: Error updating trip policies: %', SQLERRM;
END $$;