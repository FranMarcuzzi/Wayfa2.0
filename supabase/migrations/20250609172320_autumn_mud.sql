/*
  # Add cover image support and storage setup

  1. Storage
    - Create storage bucket for trip images
    - Set up RLS policies for storage access
    
  2. Database Changes
    - Add cover_image column to trips table
    - Add storage policies for authenticated users
*/

-- Add cover_image column to trips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE trips ADD COLUMN cover_image text;
  END IF;
END $$;

-- Create storage bucket for trip images
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-images', 'trip-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for trip images
CREATE POLICY "Authenticated users can upload trip images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'trip-images');

CREATE POLICY "Anyone can view trip images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'trip-images');

CREATE POLICY "Users can update their own trip images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'trip-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own trip images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'trip-images' AND auth.uid()::text = (storage.foldername(name))[1]);