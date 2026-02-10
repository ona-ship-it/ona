-- Add bio column to profiles table
-- Date: 2026-02-10

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio text;

COMMENT ON COLUMN profiles.bio IS 'User bio/description';
