-- Test Admin Authentication in Production
-- Run this in Supabase SQL Editor to check admin user setup

-- 1. Check if the admin user exists in auth.users
SELECT 'Auth user check:' as test_type, id, email, created_at 
FROM auth.users 
WHERE email = 'richtheocrypto@gmail.com';

-- 2. Check if the admin user exists in app_users
SELECT 'App user check:' as test_type, id, email, username, current_rank, reputation_points
FROM public.app_users 
WHERE email = 'richtheocrypto@gmail.com';

-- 3. Check admin role assignments in user_roles
SELECT 'Role assignment check:' as test_type, 
       ur.user_id,
       r.name as role_name,
       ur.created_at as assigned_at
FROM onagui.user_roles ur
JOIN onagui.roles r ON ur.role_id = r.id
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'richtheocrypto@gmail.com';

-- 4. Test the is_admin_user RPC function for this specific user
SELECT 'RPC function test:' as test_type, 
       onagui.is_admin_user(au.id) as is_admin_result
FROM auth.users au
WHERE au.email = 'richtheocrypto@gmail.com';

-- 5. Check if the RPC function exists
SELECT 'RPC function exists:' as test_type, 
       proname as function_name,
       pronamespace::regnamespace as schema_name
FROM pg_proc 
WHERE proname = 'is_admin_user';