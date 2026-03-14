-- Delete all users and related data
-- Run this ONCE to clean the database before implementing OAuth

-- This will cascade delete related data in profiles, tickets, etc.
-- due to foreign key constraints

-- Delete all users (this will cascade to profiles and other related tables)
-- Note: This uses the auth schema, not public schema
DELETE FROM auth.users;

-- Optional: Reset any sequences if needed
-- (Profiles and other tables will auto-clean due to CASCADE)

-- Verify deletion
DO $$
BEGIN
  RAISE NOTICE 'All users deleted. Current user count: %', (SELECT COUNT(*) FROM auth.users);
END $$;
