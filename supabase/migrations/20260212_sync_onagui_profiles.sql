-- Sync profiles into onagui_profiles
-- Date: 2026-02-12

ALTER TABLE public.onagui_profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS twitter_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS tiktok_url text,
ADD COLUMN IF NOT EXISTS youtube_url text,
ADD COLUMN IF NOT EXISTS website_url text;

COMMENT ON COLUMN public.onagui_profiles.bio IS 'User bio/description synced from profiles';
COMMENT ON COLUMN public.onagui_profiles.twitter_url IS 'User Twitter/X profile URL synced from profiles';
COMMENT ON COLUMN public.onagui_profiles.instagram_url IS 'User Instagram profile URL synced from profiles';
COMMENT ON COLUMN public.onagui_profiles.facebook_url IS 'User Facebook profile URL synced from profiles';
COMMENT ON COLUMN public.onagui_profiles.linkedin_url IS 'User LinkedIn profile URL synced from profiles';
COMMENT ON COLUMN public.onagui_profiles.tiktok_url IS 'User TikTok profile URL synced from profiles';
COMMENT ON COLUMN public.onagui_profiles.youtube_url IS 'User YouTube channel URL synced from profiles';
COMMENT ON COLUMN public.onagui_profiles.website_url IS 'User personal website URL synced from profiles';

-- Backfill missing rows
INSERT INTO public.onagui_profiles (
  id,
  full_name,
  avatar_url,
  bio,
  twitter_url,
  instagram_url,
  facebook_url,
  linkedin_url,
  tiktok_url,
  youtube_url,
  website_url,
  created_at,
  updated_at
)
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.twitter_url,
  p.instagram_url,
  p.facebook_url,
  p.linkedin_url,
  p.tiktok_url,
  p.youtube_url,
  p.website_url,
  COALESCE(p.created_at, now()),
  now()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.onagui_profiles op
  WHERE op.id = p.id
);

-- Backfill existing rows
UPDATE public.onagui_profiles op
SET
  full_name = p.full_name,
  avatar_url = p.avatar_url,
  bio = p.bio,
  twitter_url = p.twitter_url,
  instagram_url = p.instagram_url,
  facebook_url = p.facebook_url,
  linkedin_url = p.linkedin_url,
  tiktok_url = p.tiktok_url,
  youtube_url = p.youtube_url,
  website_url = p.website_url,
  updated_at = now()
FROM public.profiles p
WHERE op.id = p.id;

CREATE OR REPLACE FUNCTION public.sync_onagui_profile_from_profiles()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.onagui_profiles (
    id,
    full_name,
    avatar_url,
    bio,
    twitter_url,
    instagram_url,
    facebook_url,
    linkedin_url,
    tiktok_url,
    youtube_url,
    website_url,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.full_name,
    NEW.avatar_url,
    NEW.bio,
    NEW.twitter_url,
    NEW.instagram_url,
    NEW.facebook_url,
    NEW.linkedin_url,
    NEW.tiktok_url,
    NEW.youtube_url,
    NEW.website_url,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    twitter_url = EXCLUDED.twitter_url,
    instagram_url = EXCLUDED.instagram_url,
    facebook_url = EXCLUDED.facebook_url,
    linkedin_url = EXCLUDED.linkedin_url,
    tiktok_url = EXCLUDED.tiktok_url,
    youtube_url = EXCLUDED.youtube_url,
    website_url = EXCLUDED.website_url,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_sync_onagui_profiles ON public.profiles;
CREATE TRIGGER on_profiles_sync_onagui_profiles
AFTER INSERT OR UPDATE OF
  full_name,
  avatar_url,
  bio,
  twitter_url,
  instagram_url,
  facebook_url,
  linkedin_url,
  tiktok_url,
  youtube_url,
  website_url
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_onagui_profile_from_profiles();
