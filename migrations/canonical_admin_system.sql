-- =====================================================
-- CANONICAL ADMIN SYSTEM - STABLE MEDIUM-TERM FIX
-- Consolidates all admin checks into single source of truth
-- =====================================================

-- =====================================================
-- 1. CREATE CANONICAL is_admin_user FUNCTION
-- =====================================================

-- Drop existing conflicting functions
DROP FUNCTION IF EXISTS public.is_admin_user(uuid);
DROP FUNCTION IF EXISTS public.is_user_admin();
DROP FUNCTION IF EXISTS is_admin_user(uuid);
DROP FUNCTION IF EXISTS is_user_admin();

-- Create the canonical admin check function
-- Priority: Role-based system > Profile fallback > Emergency whitelist
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, onagui
AS $$
DECLARE
    user_email text;
    is_role_admin boolean := false;
    is_profile_admin boolean := false;
    is_emergency_admin boolean := false;
BEGIN
    -- Return false if no user provided
    IF user_uuid IS NULL THEN
        RETURN false;
    END IF;

    -- Get user email for emergency whitelist check
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = user_uuid;

    -- 🚨 EMERGENCY WHITELIST (for hotfix compatibility)
    -- Check environment variable admin email
    IF user_email = current_setting('app.admin_email', true) 
       OR user_email = 'richtheocrypto@gmail.com' THEN
        is_emergency_admin := true;
    END IF;

    -- PRIMARY: Role-based admin check
    SELECT EXISTS (
        SELECT 1 FROM onagui.user_roles ur
        JOIN onagui.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid AND r.name = 'admin'
    ) INTO is_role_admin;

    -- FALLBACK: Profile-based admin check
    SELECT EXISTS (
        SELECT 1 FROM onagui_profiles p
        WHERE p.id = user_uuid 
        AND (p.is_admin = true OR p.onagui_type = 'admin')
    ) INTO is_profile_admin;

    -- Return true if any method confirms admin status
    RETURN is_emergency_admin OR is_role_admin OR is_profile_admin;

EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return false for safety
        RAISE WARNING 'is_admin_user error for user %: %', user_uuid, SQLERRM;
        RETURN false;
END;
$$;

-- =====================================================
-- 2. CREATE HELPER FUNCTIONS
-- =====================================================

-- Convenience function for current user
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT public.is_admin_user(auth.uid());
$$;

-- Function to get admin status with details (for debugging)
CREATE OR REPLACE FUNCTION public.get_admin_status(user_uuid uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, onagui
AS $$
DECLARE
    user_email text;
    role_admin boolean := false;
    profile_admin boolean := false;
    emergency_admin boolean := false;
    result jsonb;
BEGIN
    -- Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;

    -- Check emergency whitelist
    IF user_email = current_setting('app.admin_email', true) 
       OR user_email = 'richtheocrypto@gmail.com' THEN
        emergency_admin := true;
    END IF;

    -- Check role-based admin
    SELECT EXISTS (
        SELECT 1 FROM onagui.user_roles ur
        JOIN onagui.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid AND r.name = 'admin'
    ) INTO role_admin;

    -- Check profile-based admin
    SELECT EXISTS (
        SELECT 1 FROM onagui_profiles p
        WHERE p.id = user_uuid 
        AND (p.is_admin = true OR p.onagui_type = 'admin')
    ) INTO profile_admin;

    -- Build result
    result := jsonb_build_object(
        'user_id', user_uuid,
        'email', user_email,
        'is_admin', (emergency_admin OR role_admin OR profile_admin),
        'admin_sources', jsonb_build_object(
            'emergency_whitelist', emergency_admin,
            'role_based', role_admin,
            'profile_based', profile_admin
        )
    );

    RETURN result;
END;
$$;

-- =====================================================
-- 3. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_status(uuid) TO authenticated;

-- Grant to anon for middleware compatibility
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO anon;

-- =====================================================
-- 4. UPDATE EXISTING ADMIN USER
-- =====================================================

-- Ensure richtheocrypto@gmail.com has admin role in role system
DO $$
DECLARE
    admin_role_id uuid;
    admin_user_id uuid;
BEGIN
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM onagui.roles WHERE name = 'admin';
    
    -- Get user ID for richtheocrypto@gmail.com
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'richtheocrypto@gmail.com';
    
    -- Assign admin role if both exist
    IF admin_role_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        INSERT INTO onagui.user_roles (user_id, role_id)
        VALUES (admin_user_id, admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        
        RAISE NOTICE 'Admin role assigned to richtheocrypto@gmail.com';
    END IF;
    
    -- Also update profile for backward compatibility
    IF admin_user_id IS NOT NULL THEN
        UPDATE onagui_profiles 
        SET is_admin = true, onagui_type = 'admin'
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Profile updated for richtheocrypto@gmail.com';
    END IF;
END $$;

-- =====================================================
-- 5. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.is_admin_user(uuid) IS 
'Canonical admin check function. Priority: Role-based > Profile fallback > Emergency whitelist';

COMMENT ON FUNCTION public.is_current_user_admin() IS 
'Convenience function to check if current authenticated user is admin';

COMMENT ON FUNCTION public.get_admin_status(uuid) IS 
'Debug function that returns detailed admin status information';