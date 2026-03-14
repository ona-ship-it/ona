-- Ensure giveaway share links point to the existing /share/:code route

CREATE OR REPLACE FUNCTION auto_generate_share_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_code IS NULL THEN
    NEW.share_code := generate_share_code();
  END IF;

  NEW.share_url := 'https://onagui.com/share/' || NEW.share_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

UPDATE giveaways
SET share_url = 'https://onagui.com/share/' || share_code
WHERE share_code IS NOT NULL
  AND (
    share_url IS NULL
    OR share_url LIKE '%/g/%'
    OR share_url NOT LIKE '%/share/%'
  );
