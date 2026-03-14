-- Ensure onagui_profiles exists (required for foreign keys)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onagui_user_type') THEN
    CREATE TYPE public.onagui_user_type AS ENUM (
      'vip',
      'active',
      'empowered',
      'signed_in',
      'subscriber'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.onagui_profiles (
  id uuid PRIMARY KEY,
  username text,
  full_name text,
  avatar_url text,
  onagui_type public.onagui_user_type,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.onagui_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON public.onagui_profiles;
CREATE POLICY "Public read profiles"
  ON public.onagui_profiles
  FOR SELECT
  USING (true);

-- Create marketplace listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.onagui_profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  price numeric(12, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  category text,
  image_url text,
  status text NOT NULL DEFAULT 'active',
  views integer NOT NULL DEFAULT 0,
  sales integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON public.marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_views ON public.marketplace_listings(views DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_sales ON public.marketplace_listings(sales DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active listings" ON public.marketplace_listings;
CREATE POLICY "Public read active listings"
  ON public.marketplace_listings
  FOR SELECT
  USING (status = 'active');

-- Create profile followers table
CREATE TABLE IF NOT EXISTS public.profile_followers (
  profile_id uuid NOT NULL REFERENCES public.onagui_profiles(id) ON DELETE CASCADE,
  follower_id uuid NOT NULL REFERENCES public.onagui_profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, follower_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_followers_profile_id ON public.profile_followers(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_followers_follower_id ON public.profile_followers(follower_id);

ALTER TABLE public.profile_followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read followers" ON public.profile_followers;
CREATE POLICY "Public read followers"
  ON public.profile_followers
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can follow profiles" ON public.profile_followers;
CREATE POLICY "Users can follow profiles"
  ON public.profile_followers
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id AND profile_id <> follower_id);
