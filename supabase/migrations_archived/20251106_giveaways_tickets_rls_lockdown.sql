-- =========================================================
-- 20251106_giveaways_tickets_rls_lockdown.sql
-- Lock down admin RBAC and user access for giveaways and tickets
-- Assumes: public.is_admin_user(uuid) exists
-- =========================================================

-- Enable RLS on giveaways and tickets
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Giveaways: public can read only active giveaways
DROP POLICY IF EXISTS view_giveaways ON public.giveaways;
DROP POLICY IF EXISTS public_read_active ON public.giveaways;
CREATE POLICY "public_read_active" ON public.giveaways
  FOR SELECT USING (status = 'active');

-- Giveaways: admin can do anything
DROP POLICY IF EXISTS admin_full_access ON public.giveaways;
CREATE POLICY "admin_full_access" ON public.giveaways
  FOR ALL
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

-- Tickets: allow user to insert tickets for themselves
DROP POLICY IF EXISTS insert_own_tickets ON public.tickets;
CREATE POLICY "insert_own_tickets" ON public.tickets
  FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

-- Tickets: allow users to select their own tickets
DROP POLICY IF EXISTS select_own_tickets ON public.tickets;
CREATE POLICY "select_own_tickets" ON public.tickets
  FOR SELECT
  USING (auth.uid()::uuid = user_id);

-- Tickets: admins can select/insert/update/delete all
DROP POLICY IF EXISTS admin_tickets ON public.tickets;
CREATE POLICY "admin_tickets" ON public.tickets
  FOR ALL
  USING (public.is_admin_user(auth.uid()::uuid))
  WITH CHECK (public.is_admin_user(auth.uid()::uuid));

-- Notes:
-- - auth.uid() resolves only for requests made with a user JWT (client).
--   For Supabase storage or service-role calls, use service role keys or server-side client.
-- - To test policies, impersonate a user JWT or call via Supabase API with a test user's cookie.