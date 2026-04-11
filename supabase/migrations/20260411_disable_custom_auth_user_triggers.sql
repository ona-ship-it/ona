-- Emergency auth hardening:
-- Drop custom triggers on auth.users that can block signup/OAuth with
-- "Database error saving new user".
--
-- Rationale:
-- New-user profile syncing is already handled post-auth in app callback flow.
-- Any failing custom trigger on auth.users should not block account creation.

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace rel_ns ON rel_ns.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace fn_ns ON fn_ns.oid = p.pronamespace
    WHERE rel_ns.nspname = 'auth'
      AND c.relname = 'users'
      AND t.tgisinternal = false
      AND fn_ns.nspname IN ('public', 'onagui')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', rec.tgname);
  END LOOP;
END
$$;

-- Clean up known legacy trigger names (safe if missing)
DROP TRIGGER IF EXISTS trigger_sync_auth_user_to_app_users ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Keep function definitions available for manual/debug usage,
-- but ensure they are not bound to auth.users inserts.
COMMENT ON SCHEMA public IS 'Custom auth.users triggers disabled to prevent signup failures.';
