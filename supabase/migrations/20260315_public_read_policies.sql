-- Fix: onagui_profiles RLS only allows users to see their OWN profile.
-- The /profiles listing page needs everyone to see all profiles.

-- Allow everyone (anon + authenticated) to view all onagui_profiles
DROP POLICY IF EXISTS "Public can view all onagui profiles" ON public.onagui_profiles;
CREATE POLICY "Public can view all onagui profiles"
  ON public.onagui_profiles
  FOR SELECT
  USING (true);

-- Also ensure the profiles table is readable (needed for the avatar_url join)
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;
CREATE POLICY "Public can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);
