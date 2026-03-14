-- Allow users to unfollow profiles
-- Date: 2026-02-11

DROP POLICY IF EXISTS "Users can unfollow profiles" ON public.profile_followers;
CREATE POLICY "Users can unfollow profiles"
  ON public.profile_followers
  FOR DELETE
  USING (auth.uid() = follower_id);
