-- Migration: giveaways RLS and activation policies
-- Date: 2025-11-22

BEGIN;

-- Ensure RLS is enabled on giveaways
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that may conflict
DROP POLICY IF EXISTS "Allow authenticated users to read own drafts or active" ON public.giveaways;
DROP POLICY IF EXISTS "Allow anon read of active giveaways" ON public.giveaways;
DROP POLICY IF EXISTS "Allow creators to update and activate own drafts" ON public.giveaways;
DROP POLICY IF EXISTS "Allow creators to activate own drafts" ON public.giveaways;

-- SELECT policies
-- Authenticated users can read their own drafts and any active giveaways
CREATE POLICY "Allow authenticated users to read own drafts or active"
ON public.giveaways FOR SELECT
TO authenticated
USING ((status = 'active') OR (creator_id = auth.uid()));

-- Anonymous users can read active giveaways (for public listings)
CREATE POLICY "Allow anon read of active giveaways"
ON public.giveaways FOR SELECT
TO anon
USING (status = 'active');

-- UPDATE policy for creators: allow editing draft rows and activating them
-- USING guards OLD row; WITH CHECK guards NEW row post-update
CREATE POLICY "Allow creators to update and activate own drafts"
ON public.giveaways FOR UPDATE
TO authenticated
USING ((creator_id = auth.uid()) AND (status = 'draft'))
WITH CHECK ((creator_id = auth.uid()) AND (status IN ('draft','active')));

COMMIT;