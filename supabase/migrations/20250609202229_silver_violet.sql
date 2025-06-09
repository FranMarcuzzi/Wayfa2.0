/*
  # Sistema de Chat para Viajes

  1. Nueva Tabla: messages
    - `id` (uuid, primary key)
    - `trip_id` (uuid, foreign key to trips)
    - `user_id` (uuid, foreign key to users)
    - `content` (text, mensaje del chat)
    - `message_type` (text, tipo: 'text', 'image', 'system')
    - `reply_to` (uuid, para responder a mensajes)
    - `edited_at` (timestamp, si fue editado)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

  2. Seguridad
    - Enable RLS en messages
    - Solo participantes del viaje pueden ver/enviar mensajes
    - Solo el autor puede editar/eliminar sus mensajes

  3. Índices para performance
    - trip_id para consultas rápidas
    - created_at para orden cronológico
    - user_id para filtros por usuario
*/

-- Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  reply_to uuid REFERENCES messages(id) ON DELETE SET NULL,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_trip_id ON messages(trip_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(trip_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);

-- RLS Policies
CREATE POLICY "Trip participants can read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT trip_participants.trip_id
      FROM trip_participants
      WHERE trip_participants.user_id = auth.uid()
      UNION
      SELECT trips.id
      FROM trips
      WHERE trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Trip participants can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    trip_id IN (
      SELECT trip_participants.trip_id
      FROM trip_participants
      WHERE trip_participants.user_id = auth.uid()
      UNION
      SELECT trips.id
      FROM trips
      WHERE trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Función para marcar mensajes como editados
CREATE OR REPLACE FUNCTION mark_message_as_edited()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content != NEW.content THEN
    NEW.edited_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_message_as_edited
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION mark_message_as_edited();