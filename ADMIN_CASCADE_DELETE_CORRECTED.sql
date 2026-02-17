-- ============================================================================
-- ONAGUI - ADMIN CASCADE DELETE SYSTEM (CORRECTED FOR ACTUAL SCHEMA)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- =====================
-- GIVEAWAYS & TICKETS
-- =====================

-- Ensure tickets cascade delete when giveaway is deleted
ALTER TABLE public.tickets
  DROP CONSTRAINT IF EXISTS tickets_giveaway_id_fkey,
  ADD CONSTRAINT tickets_giveaway_id_fkey
    FOREIGN KEY (giveaway_id)
    REFERENCES public.giveaways(id)
    ON DELETE CASCADE;

-- =====================
-- FUNDRAISERS & DONATIONS
-- =====================

-- Donations cascade delete when fundraiser is deleted
ALTER TABLE public.donations
  DROP CONSTRAINT IF EXISTS donations_fundraiser_id_fkey,
  ADD CONSTRAINT donations_fundraiser_id_fkey
    FOREIGN KEY (fundraiser_id)
    REFERENCES public.fundraisers(id)
    ON DELETE CASCADE;

-- Fundraiser updates cascade delete
ALTER TABLE IF EXISTS public.fundraiser_updates
  DROP CONSTRAINT IF EXISTS fundraiser_updates_fundraiser_id_fkey,
  ADD CONSTRAINT fundraiser_updates_fundraiser_id_fkey
    FOREIGN KEY (fundraiser_id)
    REFERENCES public.fundraisers(id)
    ON DELETE CASCADE;

-- Fundraiser comments cascade delete
ALTER TABLE IF EXISTS public.fundraiser_comments
  DROP CONSTRAINT IF EXISTS fundraiser_comments_fundraiser_id_fkey,
  ADD CONSTRAINT fundraiser_comments_fundraiser_id_fkey
    FOREIGN KEY (fundraiser_id)
    REFERENCES public.fundraisers(id)
    ON DELETE CASCADE;

-- =====================
-- MARKETPLACE
-- =====================

-- Orders cascade delete when listing is deleted (if orders table exists)
ALTER TABLE IF EXISTS public.marketplace_orders
  DROP CONSTRAINT IF EXISTS marketplace_orders_listing_id_fkey,
  ADD CONSTRAINT marketplace_orders_listing_id_fkey
    FOREIGN KEY (listing_id)
    REFERENCES public.marketplace_listings(id)
    ON DELETE CASCADE;

-- =====================
-- ADMIN CHECK FUNCTION
-- =====================

-- Create an admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =====================
-- ADMIN DELETE POLICIES
-- =====================

-- Admin can delete any giveaway
DROP POLICY IF EXISTS "Admin can delete any giveaway" ON public.giveaways;
CREATE POLICY "Admin can delete any giveaway" ON public.giveaways
  FOR DELETE USING (
    creator_id = auth.uid()  -- creator can delete own
    OR is_admin()             -- admin can delete any
  );

-- Admin can delete any fundraiser
DROP POLICY IF EXISTS "Admin can delete any fundraiser" ON public.fundraisers;
CREATE POLICY "Admin can delete any fundraiser" ON public.fundraisers
  FOR DELETE USING (
    user_id = auth.uid()
    OR is_admin()
  );

-- Admin can delete any marketplace listing
DROP POLICY IF EXISTS "Admin can delete any listing" ON public.marketplace_listings;
CREATE POLICY "Admin can delete any listing" ON public.marketplace_listings
  FOR DELETE USING (
    seller_id = auth.uid()
    OR is_admin()
  );

-- =====================
-- SOFT DELETE COLUMNS (Optional - Better for audit trail)
-- =====================

-- Add soft delete tracking to giveaways
ALTER TABLE public.giveaways
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Add soft delete tracking to fundraisers
ALTER TABLE public.fundraisers
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Add soft delete tracking to marketplace listings
ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- =====================
-- UPDATE SELECT POLICIES FOR SOFT DELETES
-- =====================

-- View active giveaways only
DROP POLICY IF EXISTS "Anyone can view active giveaways" ON public.giveaways;
CREATE POLICY "Anyone can view active giveaways" ON public.giveaways
  FOR SELECT USING (is_deleted = false OR is_deleted IS NULL);

-- View active fundraisers only
DROP POLICY IF EXISTS "Anyone can view active fundraisers" ON public.fundraisers;
CREATE POLICY "Anyone can view active fundraisers" ON public.fundraisers
  FOR SELECT USING (is_deleted = false OR is_deleted IS NULL);

-- View active marketplace listings only
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings
  FOR SELECT USING (is_deleted = false OR is_deleted IS NULL);

-- =====================
-- SOFT DELETE FUNCTIONS
-- =====================

-- Soft delete function (call this from your admin panel instead of hard delete)
CREATE OR REPLACE FUNCTION admin_soft_delete(
  p_table TEXT,
  p_post_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verify caller is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Soft delete based on table
  EXECUTE format(
    'UPDATE %I SET is_deleted = true, deleted_at = NOW(), deleted_by = $1 WHERE id = $2',
    p_table
  ) USING auth.uid(), p_post_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore function (undo soft delete)
CREATE OR REPLACE FUNCTION admin_restore_post(
  p_table TEXT,
  p_post_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  EXECUTE format(
    'UPDATE %I SET is_deleted = false, deleted_at = NULL, deleted_by = NULL WHERE id = $1',
    p_table
  ) USING p_post_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- VERIFICATION
-- =====================

SELECT 'Admin cascade delete system installed successfully! ✅' as result;
