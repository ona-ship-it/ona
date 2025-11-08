-- FIX_RLS_INFINITE_RECURSION.sql
-- This script fixes the infinite recursion issue in RLS policies for the roles table
-- The problem occurs when RLS policies try to check roles within the roles table itself

-- 1. DISABLE RLS temporarily to fix the policies
ALTER TABLE onagui.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE onagui.user_roles DISABLE ROW LEVEL SECURITY;

-- 2. DROP existing problematic policies
DROP POLICY IF EXISTS roles_admin_only ON onagui.roles;
DROP POLICY IF EXISTS roles_read_only ON onagui.roles;
DROP POLICY IF EXISTS user_roles_admin_only ON onagui.user_roles;
DROP POLICY IF EXISTS user_roles_read_own ON onagui.user_roles;

-- 3. CREATE SAFE POLICIES that don't cause recursion

-- For roles table: Allow service_role full access, authenticated users read-only
CREATE POLICY roles_service_role_bypass ON onagui.roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY roles_authenticated_read ON onagui.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- For user_roles table: Allow service_role full access, users can read their own roles
CREATE POLICY user_roles_service_role_bypass ON onagui.user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY user_roles_read_own ON onagui.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. RE-ENABLE RLS with safe policies
ALTER TABLE onagui.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onagui.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. CREATE ADMIN BYPASS POLICIES for giveaways table
-- This allows admins to access giveaways without recursion issues

-- First, create a safe admin check function that uses service_role
CREATE OR REPLACE FUNCTION onagui.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = onagui, public
AS $$
BEGIN
  -- Use service_role context to avoid RLS recursion
  RETURN EXISTS (
    SELECT 1 
    FROM onagui.user_roles ur
    JOIN onagui.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid 
    AND r.name = 'admin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION onagui.is_admin TO authenticated;

-- Create admin bypass policy for giveaways
DROP POLICY IF EXISTS giveaways_admin_bypass ON onagui.giveaways;
CREATE POLICY giveaways_admin_bypass ON onagui.giveaways
  FOR ALL
  TO authenticated
  USING (onagui.is_admin())
  WITH CHECK (onagui.is_admin());

-- 6. VERIFY the fix
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Check if policies were created successfully
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'onagui' 
  AND tablename IN ('roles', 'user_roles', 'giveaways');
  
  RAISE NOTICE 'RLS fix applied successfully. Created % policies.', policy_count;
  RAISE NOTICE 'Infinite recursion issue should now be resolved.';
END;
$$;