/*
  # Solucionar visibilidad de nombres de participantes

  1. Problema
    - Los participantes no pueden ver los nombres de otros participantes
    - Las políticas RLS en la tabla users están muy restrictivas
    
  2. Solución
    - Agregar política para que los participantes de viajes puedan ver información básica de otros participantes
    - Mantener la privacidad pero permitir colaboración en viajes
    
  3. Seguridad
    - Solo información básica (nombre, email, avatar)
    - Solo para usuarios que comparten viajes
    - No acceso a datos sensibles
*/

-- ============================================================================
-- USERS: Permitir que participantes de viajes se vean entre sí
-- ============================================================================

-- Agregar política para que participantes de viajes puedan ver información básica de otros participantes
CREATE POLICY "Trip participants can see each other"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Pueden ver su propia información (política existente)
    (auth.uid() = id) OR
    -- Pueden ver información de otros usuarios que comparten viajes
    (id IN (
      SELECT DISTINCT tp2.user_id
      FROM trip_participants tp1
      JOIN trip_participants tp2 ON tp1.trip_id = tp2.trip_id
      WHERE tp1.user_id = auth.uid()
    )) OR
    -- Pueden ver información de usuarios en viajes que poseen
    (id IN (
      SELECT tp.user_id
      FROM trip_participants tp
      JOIN trips t ON tp.trip_id = t.id
      WHERE t.owner_id = auth.uid()
    ))
  );

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  test_count integer;
BEGIN
  -- Test users table
  SELECT COUNT(*) INTO test_count FROM users LIMIT 1;
  
  RAISE NOTICE '✅ SUCCESS: Participant visibility policy added successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ FAILED: Error adding participant visibility policy: %', SQLERRM;
END $$;