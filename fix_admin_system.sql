-- Add missing columns to onagui_profiles table
ALTER TABLE onagui_profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update existing profiles with email from auth.users
UPDATE onagui_profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE onagui_profiles.id = auth.users.id;

-- Create or replace the is_user_admin RPC function
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is admin in onagui_profiles
  RETURN EXISTS (
    SELECT 1 
    FROM onagui_profiles 
    WHERE id = auth.uid() 
    AND is_admin = TRUE
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_user_admin() TO authenticated;

-- Set specific user as admin (replace with your admin email)
UPDATE onagui_profiles 
SET is_admin = TRUE 
WHERE email = 'samiraeddaoudi88@gmail.com';

-- Also set richtheocrypto@gmail.com as admin if needed
UPDATE onagui_profiles 
SET is_admin = TRUE 
WHERE email = 'richtheocrypto@gmail.com';