-- Allow authenticated users to create/update only their own onagui profile rows.
-- Fixes avatar/profile sync writes blocked by RLS.

ALTER TABLE public.onagui_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own onagui profile" ON public.onagui_profiles;
CREATE POLICY "Users can insert own onagui profile"
  ON public.onagui_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own onagui profile" ON public.onagui_profiles;
CREATE POLICY "Users can update own onagui profile"
  ON public.onagui_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own onagui profile" ON public.onagui_profiles;
CREATE POLICY "Users can view own onagui profile"
  ON public.onagui_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
