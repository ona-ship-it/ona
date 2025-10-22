-- Add Admin Bypass Policies for Giveaways and Tickets
-- This script adds the missing admin bypass policies that allow users with 'admin' role
-- to perform all operations on giveaways and tickets tables

-- ============================================================================
-- GIVEAWAYS TABLE ADMIN POLICIES
-- ============================================================================

-- Add admin bypass policy for giveaways (all operations)
CREATE POLICY IF NOT EXISTS "giveaways_admin_bypass" ON onagui.giveaways
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- ============================================================================
-- TICKETS TABLE ADMIN POLICIES  
-- ============================================================================

-- Add admin bypass policy for tickets (all operations)
CREATE POLICY IF NOT EXISTS "admins_full_access_tickets" ON onagui.tickets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Query to verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('giveaways', 'tickets')
  AND policyname IN ('giveaways_admin_bypass', 'admins_full_access_tickets')
ORDER BY tablename, policyname;

-- ============================================================================
-- NOTES
-- ============================================================================

-- These policies will allow users with the 'admin' role in the onagui.user_roles 
-- system to bypass the creator-only restrictions and perform all operations
-- (SELECT, INSERT, UPDATE, DELETE) on both giveaways and tickets tables.

-- The existing creator-based policies will continue to work for non-admin users:
-- - giveaways_delete_no_tickets (DELETE) — creator-only delete
-- - giveaways_insert_owner (INSERT) — creator-only insert  
-- - giveaways_select_owner (SELECT) — public SELECT = true
-- - giveaways_update_photo_description (UPDATE) — creator-only update
-- - tickets_insert_buyer (INSERT) — buyer-only insert
-- - tickets_select_owner_or_giveaway_creator (SELECT) — buyer or giveaway creator

-- PostgreSQL RLS evaluates policies with OR logic, so if ANY policy allows
-- the operation, it will be permitted. This means admins will have full access
-- while regular users still follow the creator-based restrictions.