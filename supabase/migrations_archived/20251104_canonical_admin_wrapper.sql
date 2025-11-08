-- Canonical admin function and wrapper
-- This migration defines `public.is_admin_user(uuid)` (canonical)
-- and a compatible wrapper `onagui.is_admin_user(uuid)` used by existing RLS policies.

-- Canonical function: role-based check first, then profile fallback
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, onagui
AS $$
BEGIN
  RETURN (
    -- Role-based admin (preferred)
    EXISTS (
      SELECT 1
      FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = user_uuid
        AND r.name = 'admin'
    )
    -- Profile-based fallback for legacy data
    OR EXISTS (
      SELECT 1
      FROM public.onagui_profiles p
      WHERE p.id = user_uuid
        AND (p.is_admin = TRUE OR p.onagui_type = 'admin')
    )
  );
END;
$$;

-- Wrapper that preserves existing RLS policy references
CREATE OR REPLACE FUNCTION onagui.is_admin_user(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, onagui
AS $$
  SELECT public.is_admin_user($1);
$$;

-- Grants for application roles
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION onagui.is_admin_user(uuid) TO authenticated;