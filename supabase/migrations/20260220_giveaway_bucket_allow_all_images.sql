-- Ensure giveaway image bucket accepts any image MIME type in existing environments
-- and supports larger uploads for creators.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  'giveaway-images',
  'giveaway-images',
  true,
  20971520,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'giveaway-images'
);

UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = NULL
WHERE id = 'giveaway-images';
