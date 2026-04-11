-- Harden auth user sync trigger so OAuth signup does not fail with
-- "Database error saving new user" when profile sync side-effects fail.

DROP TRIGGER IF EXISTS trigger_sync_auth_user_to_app_users ON auth.users;

CREATE OR REPLACE FUNCTION public.sync_auth_user_to_app_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  base_username text;
  safe_username text;
  safe_full_name text;
  safe_avatar_url text;
BEGIN
  base_username := lower(
    regexp_replace(
      coalesce(
        NEW.raw_user_meta_data->>'username',
        split_part(coalesce(NEW.email, ''), '@', 1),
        'user'
      ),
      '[^a-z0-9_]',
      '',
      'g'
    )
  );

  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user';
  END IF;

  -- Keep usernames deterministic + unique to avoid collisions.
  safe_username := left(base_username, 20) || '_' || left(NEW.id::text, 8);
  safe_full_name := nullif(coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), '');
  safe_avatar_url := nullif(coalesce(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''), '');

  BEGIN
    INSERT INTO public.app_users (id, email, username, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      safe_username,
      NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      username = COALESCE(EXCLUDED.username, public.app_users.username);
  EXCEPTION
    WHEN undefined_table OR undefined_column THEN
      RAISE WARNING 'sync_auth_user_to_app_users: app_users schema mismatch for user %', NEW.id;
    WHEN others THEN
      RAISE WARNING 'sync_auth_user_to_app_users: app_users sync failed for user % (%).', NEW.id, SQLERRM;
  END;

  BEGIN
    INSERT INTO public.onagui_profiles (
      id,
      username,
      full_name,
      avatar_url,
      onagui_type,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      safe_username,
      safe_full_name,
      safe_avatar_url,
      'signed_in',
      NEW.created_at,
      coalesce(NEW.updated_at, now())
    )
    ON CONFLICT (id) DO UPDATE SET
      username = COALESCE(EXCLUDED.username, public.onagui_profiles.username),
      full_name = COALESCE(EXCLUDED.full_name, public.onagui_profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.onagui_profiles.avatar_url),
      updated_at = coalesce(EXCLUDED.updated_at, now());
  EXCEPTION
    WHEN undefined_table OR undefined_column THEN
      RAISE WARNING 'sync_auth_user_to_app_users: onagui_profiles schema mismatch for user %', NEW.id;
    WHEN others THEN
      RAISE WARNING 'sync_auth_user_to_app_users: onagui_profiles sync failed for user % (%).', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sync_auth_user_to_app_users
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_user_to_app_users();

GRANT EXECUTE ON FUNCTION public.sync_auth_user_to_app_users() TO postgres, authenticated, service_role;

COMMENT ON FUNCTION public.sync_auth_user_to_app_users() IS
'Hardened auth.users sync trigger that avoids blocking signup on profile-sync errors.';
