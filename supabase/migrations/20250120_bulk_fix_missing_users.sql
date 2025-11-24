-- Bulk fix: Insert missing users from auth.users into onagui.app_users
-- This migration safely adds the 3 missing users identified in the sync report

-- Insert missing users with proper data mapping
INSERT INTO onagui.app_users (
    id,
    email, 
    username,
    profile_image,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    -- Extract username from email (part before @)
    COALESCE(
        NULLIF(split_part(au.email, '@', 1), ''),
        'user_' || substr(au.id::text, 1, 8)
    ) as username,
    NULL as profile_image,
    COALESCE(au.created_at, NOW()) as created_at,
    COALESCE(au.updated_at, NOW()) as updated_at
FROM auth.users au
LEFT JOIN onagui.app_users apu ON au.id = apu.id
WHERE apu.id IS NULL  -- Only insert missing users
ON CONFLICT (id) DO NOTHING;  -- Idempotent: skip if already exists

-- Report the results
DO $$
DECLARE
    inserted_count INTEGER;
    total_auth_users INTEGER;
    total_app_users INTEGER;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO total_auth_users FROM auth.users;
    SELECT COUNT(*) INTO total_app_users FROM onagui.app_users;
    
    -- Calculate inserted (this will be 0 if run again due to ON CONFLICT)
    inserted_count := total_app_users - (total_auth_users - 3);
    
    RAISE NOTICE '=== BULK FIX RESULTS ===';
    RAISE NOTICE 'Total auth.users: %', total_auth_users;
    RAISE NOTICE 'Total onagui.app_users after fix: %', total_app_users;
    RAISE NOTICE 'Users should now be in sync: %', 
        CASE WHEN total_auth_users = total_app_users THEN 'YES ✓' ELSE 'NO ✗' END;
END $$;

-- Verify sync status
SELECT 
    'SYNC STATUS' as report_type,
    COUNT(au.id) as auth_users,
    COUNT(apu.id) as app_users,
    COUNT(CASE WHEN au.id = apu.id THEN 1 END) as synced_users,
    COUNT(CASE WHEN au.id IS NULL THEN 1 END) as orphaned_app_users,
    COUNT(CASE WHEN apu.id IS NULL THEN 1 END) as missing_app_users
FROM auth.users au
FULL OUTER JOIN onagui.app_users apu ON au.id = apu.id;