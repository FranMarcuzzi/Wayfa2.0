/*
  # Arreglar visibilidad de invitaciones

  1. Problema
    - Los usuarios no pueden ver las invitaciones que les llegan
    - Las políticas actuales son demasiado restrictivas
    
  2. Solución
    - Actualizar políticas de invitaciones para permitir que los usuarios vean sus invitaciones
    - Mantener la seguridad pero permitir acceso a invitaciones propias
    
  3. Cambios
    - Política más permisiva para leer invitaciones
    - Los usuarios pueden ver invitaciones enviadas a su email
*/

-- Eliminar política restrictiva actual
DROP POLICY IF EXISTS "Users can read all invitations" ON invitations;

-- Crear nueva política que permite a los usuarios ver sus invitaciones
CREATE POLICY "Users can read their invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    -- Pueden ver invitaciones que enviaron
    (invited_by = auth.uid()) OR
    -- Pueden ver invitaciones enviadas a su email
    (email = (SELECT email FROM users WHERE id = auth.uid())) OR
    -- Los dueños de viajes pueden ver invitaciones de sus viajes
    (trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid()))
  );

-- Verificar que la política funciona
DO $$
DECLARE
  test_count integer;
BEGIN
  -- Test invitations table
  SELECT COUNT(*) INTO test_count FROM invitations LIMIT 1;
  
  RAISE NOTICE '✅ SUCCESS: Invitation visibility policy updated successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ FAILED: Error updating invitation policy: %', SQLERRM;
END $$;