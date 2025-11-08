-- =========================================================
-- 20251106_ensure_admin_update_giveaways_status.sql
-- Ensure RLS allows admins to update giveaways.status while blocking normal users
-- Depends on: public.is_admin_user(uuid)
-- =========================================================

-- Enable RLS on giveaways (idempotent)
ALTER TABLE IF EXISTS public.giveaways ENABLE ROW LEVEL SECURITY;

-- Public SELECT policy: only view active giveaways (keep base policy restrictive)
DROP POLICY IF EXISTS public_read_active ON public.giveaways;
CREATE POLICY public_read_active ON public.giveaways
  FOR SELECT
  USING (status = 'active');

-- Explicit admin-only UPDATE policy for giveaways
-- Allows updating any fields (including status) only if the actor is admin
DROP POLICY IF EXISTS admin_update_giveaways ON public.giveaways;
CREATE POLICY admin_update_giveaways ON public.giveaways
  FOR UPDATE
  USING (
    public.is_admin_user(
      coalesce(current_setting('jwt.claims.sub', true)::uuid, auth.uid()::uuid)
    )
  )
  WITH CHECK (
    public.is_admin_user(
      coalesce(current_setting('jwt.claims.sub', true)::uuid, auth.uid()::uuid)
    )
  );

-- Optional: admin full access remains compatible if present in other migrations.
-- This migration is additive and safe alongside existing admin_full_access policies.