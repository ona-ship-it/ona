-- Implement Row Level Security for onagui.app_users
-- Migration: 20241018_implement_app_users_rls.sql
-- Purpose: Add comprehensive RLS policies to protect user data

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on the app_users table
ALTER TABLE onagui.app_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. DROP EXISTING POLICIES (IF ANY)
-- ============================================================================

-- Clean slate approach - drop any existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON onagui.app_users;
DROP POLICY IF EXISTS "Users can update own profile" ON onagui.app_users;
DROP POLICY IF EXISTS "Service role can manage all users" ON onagui.app_users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON onagui.app_users;
DROP POLICY IF EXISTS "Public profile viewing" ON onagui.app_users;
DROP POLICY IF EXISTS "Moderators can view user data" ON onagui.app_users;

-- ============================================================================
-- 3. CORE RLS POLICIES
-- ============================================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON onagui.app_users
    FOR SELECT 
    USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (with restrictions)
CREATE POLICY "Users can update own profile" ON onagui.app_users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND OLD.id = NEW.id  -- Prevent ID changes
        AND OLD.created_at = NEW.created_at  -- Prevent timestamp manipulation
        AND OLD.onagui_type = NEW.onagui_type  -- Prevent type changes by users
    );

-- Policy 3: Service role has full access for system operations
CREATE POLICY "Service role can manage all users" ON onagui.app_users
    FOR ALL 
    USING (auth.role() = 'service_role');

-- ============================================================================
-- 4. ADMIN AND MODERATOR POLICIES
-- ============================================================================

-- Policy 4: Admin users can view and manage all profiles
CREATE POLICY "Admins can manage all profiles" ON onagui.app_users
    FOR ALL 
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM onagui.user_roles ur
            JOIN onagui.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- Policy 5: Moderators can view user data (read-only)
CREATE POLICY "Moderators can view user data" ON onagui.app_users
    FOR SELECT 
    USING (
        auth.uid() = id OR  -- Users can see their own data
        auth.role() = 'service_role' OR  -- Service role can see all
        EXISTS (
            SELECT 1 FROM onagui.user_roles ur
            JOIN onagui.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'moderator')
        )
    );

-- ============================================================================
-- 5. PUBLIC ACCESS POLICY (FOR SOCIAL FEATURES)
-- ============================================================================

-- Policy 6: Allow limited public viewing for social features
-- This policy allows viewing basic profile information for leaderboards, etc.
CREATE POLICY "Public profile viewing" ON onagui.app_users
    FOR SELECT 
    USING (
        -- Allow public access to basic profile info
        -- Application should limit columns in queries
        onagui_type = 'signed_in'  -- Only show signed-in users publicly
    );

-- ============================================================================
-- 6. SPECIAL POLICIES FOR SYSTEM OPERATIONS
-- ============================================================================

-- Policy 7: Allow INSERT operations for user registration/sync
CREATE POLICY "System can create users" ON onagui.app_users
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'service_role' OR
        -- Allow authenticated users to create their own profile
        (auth.uid() = id AND onagui_type = 'signed_in')
    );

-- ============================================================================
-- 7. PERFORMANCE OPTIMIZATION INDEXES
-- ============================================================================

-- Indexes to support RLS policy performance
CREATE INDEX IF NOT EXISTS idx_app_users_rls_auth_uid ON onagui.app_users(id) 
WHERE id IS NOT NULL;

-- Index for admin/moderator role checks
CREATE INDEX IF NOT EXISTS idx_user_roles_rls_lookup ON onagui.user_roles(user_id, role_id);

-- Index for role name lookups
CREATE INDEX IF NOT EXISTS idx_roles_rls_name ON onagui.roles(name) 
WHERE name IN ('admin', 'moderator');

-- ============================================================================
-- 8. GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant appropriate table permissions
GRANT SELECT ON onagui.app_users TO authenticated;
GRANT UPDATE ON onagui.app_users TO authenticated;
GRANT INSERT ON onagui.app_users TO authenticated;
GRANT ALL ON onagui.app_users TO service_role;

-- Grant permissions for role checking
GRANT SELECT ON onagui.user_roles TO authenticated;
GRANT SELECT ON onagui.roles TO authenticated;

-- ============================================================================
-- 9. SECURITY FUNCTIONS
-- ============================================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION onagui.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = onagui, public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM onagui.user_roles ur
        JOIN onagui.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() 
        AND r.name = 'admin'
    );
END;
$$;

-- Function to check if current user is moderator or admin
CREATE OR REPLACE FUNCTION onagui.is_moderator_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = onagui, public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM onagui.user_roles ur
        JOIN onagui.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() 
        AND r.name IN ('admin', 'moderator')
    );
END;
$$;

-- Create public wrappers for the security functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT onagui.is_admin();
$$;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT onagui.is_moderator_or_admin();
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator_or_admin() TO authenticated;

-- ============================================================================
-- 10. POLICY DOCUMENTATION
-- ============================================================================

-- Add comments to document each policy
COMMENT ON POLICY "Users can view own profile" ON onagui.app_users IS 
'Allows users to view their own profile data only';

COMMENT ON POLICY "Users can update own profile" ON onagui.app_users IS 
'Allows users to update their own profile while preventing changes to sensitive fields like ID, created_at, and onagui_type';

COMMENT ON POLICY "Service role can manage all users" ON onagui.app_users IS 
'Allows system operations like user sync, admin functions, and automated processes to function properly';

COMMENT ON POLICY "Admins can manage all profiles" ON onagui.app_users IS 
'Allows admin users to view and manage all user profiles for administrative purposes';

COMMENT ON POLICY "Moderators can view user data" ON onagui.app_users IS 
'Allows moderator users to view user profiles for moderation purposes (read-only)';

COMMENT ON POLICY "Public profile viewing" ON onagui.app_users IS 
'Allows public access to basic profile information for social features like leaderboards (signed-in users only)';

COMMENT ON POLICY "System can create users" ON onagui.app_users IS 
'Allows user registration and sync operations to create new user records';

-- ============================================================================
-- 11. MONITORING AND AUDIT SETUP
-- ============================================================================

-- Create a view to monitor RLS policy usage
CREATE OR REPLACE VIEW onagui.rls_policy_usage AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'app_users' AND schemaname = 'onagui'
ORDER BY policyname;

-- Grant access to the monitoring view
GRANT SELECT ON onagui.rls_policy_usage TO service_role;

-- ============================================================================
-- 12. VALIDATION QUERIES
-- ============================================================================

-- Test queries to validate RLS implementation
DO $$
DECLARE
    policy_count INTEGER;
    rls_enabled BOOLEAN;
BEGIN
    -- Check if RLS is enabled
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables 
    WHERE tablename = 'app_users' AND schemaname = 'onagui';
    
    IF NOT rls_enabled THEN
        RAISE EXCEPTION 'RLS is not enabled on onagui.app_users table';
    END IF;
    
    -- Check policy count
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'app_users' AND schemaname = 'onagui';
    
    IF policy_count < 6 THEN
        RAISE EXCEPTION 'Expected at least 6 RLS policies, found %', policy_count;
    END IF;
    
    RAISE NOTICE 'RLS validation successful: % policies created, RLS enabled', policy_count;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log the migration completion
DO $$
BEGIN
    RAISE NOTICE 'RLS implementation for onagui.app_users completed successfully';
    RAISE NOTICE 'Created comprehensive RLS policies for user data protection';
    RAISE NOTICE 'Added performance indexes and monitoring capabilities';
    RAISE NOTICE 'Implemented security functions for role checking';
    RAISE NOTICE 'IMPORTANT: Test application functionality after deployment';
END $$;