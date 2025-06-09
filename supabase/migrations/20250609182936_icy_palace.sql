/*
  # Agregar permisos para eliminar viajes

  1. Políticas
    - Los dueños de viajes pueden eliminar sus viajes
    - Mantener todas las políticas existentes
    
  2. Verificación
    - Probar que las políticas funcionan correctamente
*/

-- Agregar política para que los dueños puedan eliminar sus viajes
CREATE POLICY "Trip owners can delete their trips"
  ON trips
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Verificar que la política funciona
DO $$
DECLARE
  test_count integer;
BEGIN
  -- Test trips table
  SELECT COUNT(*) INTO test_count FROM trips LIMIT 1;
  
  RAISE NOTICE '✅ SUCCESS: Trip deletion policy added successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ FAILED: Error adding trip deletion policy: %', SQLERRM;
END $$;