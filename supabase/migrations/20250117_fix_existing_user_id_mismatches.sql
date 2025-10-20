-- Migration: Fix existing user ID mismatches
-- This script identifies and resolves mismatched IDs between auth.users and onagui.app_users
-- Run this AFTER the auto-sync trigger is in place

-- Step 1: Create a temporary table to track the mapping
CREATE TEMP TABLE user_id_mapping AS
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created_at,
    app.id as app_user_id,
    app.email as app_email,
    app.created_at as app_created_at,
    CASE 
        WHEN au.id = app.id THEN 'MATCHED'
        WHEN au.id IS NULL THEN 'MISSING_IN_AUTH'
        WHEN app.id IS NULL THEN 'MISSING_IN_APP_USERS'
        ELSE 'MISMATCHED'
    END as status
FROM auth.users au
FULL OUTER JOIN onagui.app_users app ON au.email = app.email
WHERE au.email IS NOT NULL OR app.email IS NOT NULL;

-- Step 2: Report on the current state
DO $$
DECLARE
    matched_count INTEGER;
    mismatched_count INTEGER;
    missing_in_auth INTEGER;
    missing_in_app INTEGER;
BEGIN
    SELECT COUNT(*) INTO matched_count FROM user_id_mapping WHERE status = 'MATCHED';
    SELECT COUNT(*) INTO mismatched_count FROM user_id_mapping WHERE status = 'MISMATCHED';
    SELECT COUNT(*) INTO missing_in_auth FROM user_id_mapping WHERE status = 'MISSING_IN_AUTH';
    SELECT COUNT(*) INTO missing_in_app FROM user_id_mapping WHERE status = 'MISSING_IN_APP_USERS';
    
    RAISE NOTICE 'User ID Sync Report:';
    RAISE NOTICE '- Matched IDs: %', matched_count;
    RAISE NOTICE '- Mismatched IDs: %', mismatched_count;
    RAISE NOTICE '- Missing in auth.users: %', missing_in_auth;
    RAISE NOTICE '- Missing in onagui.app_users: %', missing_in_app;
END $$;

-- Step 3: Create missing records in onagui.app_users for auth.users that don't exist
INSERT INTO onagui.app_users (id, email, username, created_at, updated_at)
SELECT 
    m.auth_user_id,
    m.auth_email,
    split_part(m.auth_email, '@', 1) as username,
    m.auth_created_at,
    NOW()
FROM user_id_mapping m
WHERE m.status = 'MISSING_IN_APP_USERS'
ON CONFLICT (id) DO NOTHING;

-- Step 4: Handle mismatched records (CAREFUL - this updates existing data)
-- Option A: Update onagui.app_users to use auth.users.id (recommended for most cases)
-- Uncomment the following block if you want to align app_users.id with auth.users.id

/*
-- First, temporarily disable foreign key constraints
ALTER TABLE onagui.user_roles DISABLE TRIGGER ALL;

-- Update app_users IDs to match auth.users IDs
UPDATE onagui.app_users 
SET id = m.auth_user_id,
    updated_at = NOW()
FROM user_id_mapping m
WHERE onagui.app_users.email = m.app_email 
  AND m.status = 'MISMATCHED'
  AND m.auth_user_id IS NOT NULL;

-- Update any user_roles that reference the old app_users.id
UPDATE onagui.user_roles 
SET user_id = m.auth_user_id
FROM user_id_mapping m
WHERE onagui.user_roles.user_id = m.app_user_id 
  AND m.status = 'MISMATCHED'
  AND m.auth_user_id IS NOT NULL;

-- Re-enable foreign key constraints
ALTER TABLE onagui.user_roles ENABLE TRIGGER ALL;
*/

-- Step 5: Create a function to manually fix specific mismatches
CREATE OR REPLACE FUNCTION onagui.fix_user_id_mismatch(
    p_email TEXT,
    p_use_auth_id BOOLEAN DEFAULT TRUE
)
RETURNS TEXT AS $$
DECLARE
    v_auth_id UUID;
    v_app_id UUID;
    v_result TEXT;
BEGIN
    -- Get the IDs for this email
    SELECT au.id INTO v_auth_id 
    FROM auth.users au 
    WHERE au.email = p_email;
    
    SELECT app.id INTO v_app_id 
    FROM onagui.app_users app 
    WHERE app.email = p_email;
    
    IF v_auth_id IS NULL THEN
        RETURN 'ERROR: No auth.users record found for email ' || p_email;
    END IF;
    
    IF v_app_id IS NULL THEN
        -- Create missing app_users record
        INSERT INTO onagui.app_users (id, email, username, created_at, updated_at)
        SELECT v_auth_id, p_email, split_part(p_email, '@', 1), au.created_at, NOW()
        FROM auth.users au WHERE au.id = v_auth_id;
        
        RETURN 'CREATED: app_users record for ' || p_email || ' with ID ' || v_auth_id;
    END IF;
    
    IF v_auth_id = v_app_id THEN
        RETURN 'OK: IDs already match for ' || p_email;
    END IF;
    
    -- Handle mismatch
    IF p_use_auth_id THEN
        -- Update app_users to use auth ID
        UPDATE onagui.user_roles SET user_id = v_auth_id WHERE user_id = v_app_id;
        UPDATE onagui.app_users SET id = v_auth_id WHERE id = v_app_id;
        v_result := 'FIXED: Updated app_users ID from ' || v_app_id || ' to ' || v_auth_id || ' for ' || p_email;
    ELSE
        v_result := 'MANUAL: Mismatch detected for ' || p_email || ' (auth: ' || v_auth_id || ', app: ' || v_app_id || ')';
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Generate a report of remaining issues
CREATE OR REPLACE VIEW onagui.user_sync_status AS
SELECT 
    COALESCE(au.email, app.email) as email,
    au.id as auth_user_id,
    app.id as app_user_id,
    CASE 
        WHEN au.id = app.id THEN 'SYNCED'
        WHEN au.id IS NULL THEN 'MISSING_IN_AUTH'
        WHEN app.id IS NULL THEN 'MISSING_IN_APP_USERS'
        ELSE 'MISMATCHED'
    END as sync_status,
    au.created_at as auth_created_at,
    app.created_at as app_created_at
FROM auth.users au
FULL OUTER JOIN onagui.app_users app ON au.email = app.email
WHERE au.email IS NOT NULL OR app.email IS NOT NULL
ORDER BY sync_status, email;

-- Add helpful comments
COMMENT ON FUNCTION onagui.fix_user_id_mismatch(TEXT, BOOLEAN) IS 
'Manually fix ID mismatch for a specific user email. Set use_auth_id=true to align app_users with auth.users ID.';

COMMENT ON VIEW onagui.user_sync_status IS 
'Shows the current sync status between auth.users and onagui.app_users';

-- Final report
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRATION COMPLETE ===';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Review sync status: SELECT * FROM onagui.user_sync_status WHERE sync_status != ''SYNCED'';';
    RAISE NOTICE '2. Fix individual mismatches: SELECT onagui.fix_user_id_mismatch(''email@example.com'');';
    RAISE NOTICE '3. Deploy the auto-sync trigger for future signups';
    RAISE NOTICE '4. Update your registration flow to use the new sync utilities';
END $$;