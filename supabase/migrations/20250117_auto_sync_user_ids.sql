-- Migration: Auto-sync auth.users.id with onagui.app_users.id
-- This trigger ensures that when a new user signs up via Supabase Auth,
-- their record is automatically created in onagui.app_users with the same ID

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION onagui.sync_auth_user_to_app_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into onagui.app_users when a new user is created in auth.users
  INSERT INTO onagui.app_users (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, onagui.app_users.username),
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS trigger_sync_auth_user_to_app_users ON auth.users;
CREATE TRIGGER trigger_sync_auth_user_to_app_users
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION onagui.sync_auth_user_to_app_users();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA onagui TO postgres;
GRANT INSERT, UPDATE ON onagui.app_users TO postgres;

-- Add helpful comment
COMMENT ON FUNCTION onagui.sync_auth_user_to_app_users() IS 
'Automatically syncs new auth.users records to onagui.app_users with matching IDs';

COMMENT ON TRIGGER trigger_sync_auth_user_to_app_users ON auth.users IS 
'Ensures auth.users.id matches onagui.app_users.id for new signups';