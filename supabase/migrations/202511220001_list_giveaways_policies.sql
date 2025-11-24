-- Verification query: list policies on public.giveaways
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'giveaways'
ORDER BY policyname, cmd;