-- Onagui: ensure handle_new_user trigger on auth.users and enforce username uniqueness
-- Safe to re-run; uses IF EXISTS / conditional guards

-- 1) Attach (or rebind) trigger to auth.users to call public.handle_new_user
DROP TRIGGER IF EXISTS onagui_create_profile_on_auth_user_insert ON auth.users;
CREATE TRIGGER onagui_create_profile_on_auth_user_insert
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 2) Ensure a single unique constraint on public.onagui_profiles(username)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'onagui_profiles_username_key'
      AND n.nspname = 'public'
      AND t.relname = 'onagui_profiles'
  ) THEN
    ALTER TABLE public.onagui_profiles
      ADD CONSTRAINT onagui_profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- 3) Remove duplicate username indexes (e.g., leftover from previous migrations)
DO $$
DECLARE idx RECORD;
BEGIN
  FOR idx IN
    SELECT i.indexname
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
      AND i.tablename = 'onagui_profiles'
      AND i.indexname LIKE 'onagui_profiles_username%'
      AND i.indexname <> 'onagui_profiles_username_key'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', idx.indexname);
  END LOOP;
END $$;

-- 4) Ensure function owner is elevated (so SECURITY DEFINER can bypass RLS properly)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    ALTER FUNCTION public.handle_new_user OWNER TO postgres;
  END IF;
END $$;

-- Notes:
-- - Assumes public.handle_new_user is already deployed with SECURITY DEFINER and proper search_path.
-- - Supabase projects typically allow triggers on auth.users; this binds the single canonical trigger.
-- - Unique constraint name follows Postgres default naming, avoiding duplicates.