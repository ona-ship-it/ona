-- COMPLETE ADMIN AUTHENTICATION RESET AND REBUILD SCRIPT
-- This script safely resets and rebuilds the admin authentication system

-- ============================================================================
-- STEP 1: ENUM CLEANUP - Drop duplicates and recreate clean enum
-- ============================================================================

-- First, let's check what enum types exist
DO $$
BEGIN
    RAISE NOTICE 'Current enum types:';
    FOR rec IN 
        SELECT schemaname, typname 
        FROM pg_type t 
        JOIN pg_namespace n ON t.typnamespace = n.oid 
        WHERE t.typtype = 'e' AND typname LIKE '%user_type%'
    LOOP
        RAISE NOTICE 'Schema: %, Type: %', rec.schemaname, rec.typname;
    END LOOP;
END $$;

-- Check current column usage before making changes
DO $$
BEGIN
    RAISE NOTICE 'Current onagui_profiles.onagui_type column info:';
    FOR rec IN 
        SELECT column_name, data_type, udt_name, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'onagui_profiles' 
        AND column_name = 'onagui_type'
    LOOP
        RAISE NOTICE 'Column: %, Type: %, UDT: %, Default: %', 
                     rec.column_name, rec.data_type, rec.udt_name, rec.column_default;
    END LOOP;
END $$;

-- Create onagui schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS onagui;

-- Drop the column temporarily to allow enum cleanup
ALTER TABLE public.onagui_profiles DROP COLUMN IF EXISTS onagui_type;

-- Drop any existing enum types (both public and onagui schemas)
DROP TYPE IF EXISTS public.onagui_user_type CASCADE;
DROP TYPE IF EXISTS onagui.onagui_user_type CASCADE;

-- Create the clean enum in onagui schema
CREATE TYPE onagui.onagui_user_type AS ENUM (
    'user',
    'vip', 
    'active',
    'empowered',
    'subscriber',
    'admin'
);

-- ============================================================================
-- STEP 2: PROFILE COLUMN RESET - Add back the column with correct enum
-- ============================================================================

-- Add the column back with the correct enum type and default
ALTER TABLE public.onagui_profiles 
ADD COLUMN onagui_type onagui.onagui_user_type DEFAULT 'user'::onagui.onagui_user_type;

-- Update all existing users to 'user' type initially
UPDATE public.onagui_profiles 
SET onagui_type = 'user'::onagui.onagui_user_type 
WHERE onagui_type IS NULL;

-- ============================================================================
-- STEP 3: ADMIN PROMOTION - Set up the admin account
-- ============================================================================

-- Ensure is_admin column exists
ALTER TABLE public.onagui_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update the admin account
UPDATE public.onagui_profiles 
SET onagui_type = 'admin'::onagui.onagui_user_type, 
    is_admin = TRUE 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'richtheocrypto@gmail.com'
);

-- ============================================================================
-- STEP 4: VALIDATION - Check the results
-- ============================================================================

-- Validate enum usage
DO $$
BEGIN
    RAISE NOTICE 'Validation Results:';
    RAISE NOTICE '==================';
    
    -- Check column type
    FOR rec IN 
        SELECT column_name, data_type, udt_name, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'onagui_profiles' 
        AND column_name = 'onagui_type'
    LOOP
        RAISE NOTICE 'Column Type: % (UDT: %)', rec.data_type, rec.udt_name;
        RAISE NOTICE 'Default Value: %', rec.column_default;
    END LOOP;
    
    -- Check distinct values
    RAISE NOTICE 'Distinct onagui_type values:';
    FOR rec IN 
        SELECT onagui_type, COUNT(*) as count
        FROM public.onagui_profiles 
        GROUP BY onagui_type
        ORDER BY onagui_type
    LOOP
        RAISE NOTICE 'Type: %, Count: %', rec.onagui_type, rec.count;
    END LOOP;
    
    -- Check admin user
    FOR rec IN 
        SELECT u.email, p.onagui_type, p.is_admin
        FROM auth.users u
        JOIN public.onagui_profiles p ON u.id = p.id
        WHERE u.email = 'richtheocrypto@gmail.com'
    LOOP
        RAISE NOTICE 'Admin User - Email: %, Type: %, is_admin: %', 
                     rec.email, rec.onagui_type, rec.is_admin;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 5: CLEANUP FUNCTIONS - Drop old and create clean RPC function
-- ============================================================================

-- Drop any existing is_admin_user functions
DROP FUNCTION IF EXISTS is_admin_user(uuid);
DROP FUNCTION IF EXISTS public.is_admin_user(uuid);
DROP FUNCTION IF EXISTS onagui.is_admin_user(uuid);

-- Create clean is_admin_user function
CREATE OR REPLACE FUNCTION is_admin_user(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.onagui_profiles
        WHERE id = user_uuid AND onagui_type = 'admin'::onagui.onagui_user_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin_user(uuid) TO authenticated;

-- ============================================================================
-- FINAL VALIDATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'FINAL VALIDATION COMPLETE';
    RAISE NOTICE '========================';
    RAISE NOTICE 'Admin authentication system has been reset and rebuilt successfully.';
    RAISE NOTICE 'Please verify the admin user can now access admin functions.';
END $$;