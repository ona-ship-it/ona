-- Fix: Update the trigger to use the correct 'public' schema instead of 'onagui'
-- The previous migration incorrectly referenced onagui.app_users when the table is actually in public schema

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS trigger_sync_auth_user_to_app_users ON auth.users;
DROP FUNCTION IF EXISTS onagui.sync_auth_user_to_app_users();

-- Create the corrected trigger function using public schema
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_app_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.app_users when a new user is created in auth.users
  INSERT INTO public.app_users (id, email, username, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.app_users.username);
  
  -- Also create/update a profile in onagui_profiles
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
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'signed_in',
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, public.onagui_profiles.username),
    full_name = COALESCE(EXCLUDED.full_name, public.onagui_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.onagui_profiles.avatar_url),
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the corrected trigger on auth.users table
CREATE TRIGGER trigger_sync_auth_user_to_app_users
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_user_to_app_users();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.sync_auth_user_to_app_users() TO postgres, authenticated, service_role;

-- Add helpful comment
COMMENT ON FUNCTION public.sync_auth_user_to_app_users() IS 
'Automatically syncs new auth.users records to public.app_users and public.onagui_profiles with matching IDs';

COMMENT ON TRIGGER trigger_sync_auth_user_to_app_users ON auth.users IS 
'Ensures auth.users.id matches public.app_users.id and creates onagui_profiles for new signups';
