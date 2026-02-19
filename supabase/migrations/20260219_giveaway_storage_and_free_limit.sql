-- Setup giveaway image storage bucket and policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  'giveaway-images',
  'giveaway-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'giveaway-images'
);

DROP POLICY IF EXISTS "Giveaway images public read" ON storage.objects;
CREATE POLICY "Giveaway images public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'giveaway-images');

DROP POLICY IF EXISTS "Giveaway images authenticated upload" ON storage.objects;
CREATE POLICY "Giveaway images authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'giveaway-images');

DROP POLICY IF EXISTS "Giveaway images owner update" ON storage.objects;
CREATE POLICY "Giveaway images owner update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'giveaway-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'giveaway-images' AND owner = auth.uid());

DROP POLICY IF EXISTS "Giveaway images owner delete" ON storage.objects;
CREATE POLICY "Giveaway images owner delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'giveaway-images' AND owner = auth.uid());

-- Optional cap for number of free tickets available in a giveaway
ALTER TABLE public.giveaways
ADD COLUMN IF NOT EXISTS free_ticket_limit INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'giveaways_free_ticket_limit_check'
  ) THEN
    ALTER TABLE public.giveaways
    ADD CONSTRAINT giveaways_free_ticket_limit_check
    CHECK (free_ticket_limit IS NULL OR free_ticket_limit > 0);
  END IF;
END $$;
