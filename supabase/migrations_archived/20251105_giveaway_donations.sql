-- =========================================================
-- 20251105_giveaway_donations.sql
-- Donations, Split Rules, Contributions, Triggers, and RPC
-- =========================================================

-- 1) Add per-giveaway split fields and cumulative totals
ALTER TABLE public.giveaways
  ADD COLUMN IF NOT EXISTS donation_split_platform NUMERIC(5,4) NOT NULL DEFAULT 0.33,
  ADD COLUMN IF NOT EXISTS donation_split_creator NUMERIC(5,4) NOT NULL DEFAULT 0.33,
  ADD COLUMN IF NOT EXISTS donation_split_prize NUMERIC(5,4) NOT NULL DEFAULT 0.34,
  ADD COLUMN IF NOT EXISTS donation_pool_usdt NUMERIC(24,8) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creator_earnings_usdt NUMERIC(24,8) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_earnings_usdt NUMERIC(24,8) NOT NULL DEFAULT 0;

-- Enforce split sum exactly equals 1.00
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'donation_split_total_check'
  ) THEN
    ALTER TABLE public.giveaways
      ADD CONSTRAINT donation_split_total_check
      CHECK (
        donation_split_platform + donation_split_creator + donation_split_prize = 1
      );
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_giveaways_donation_totals ON public.giveaways(id, donation_pool_usdt, creator_earnings_usdt, platform_earnings_usdt);

-- 2) Ensure prize_pool_usdt stays in sync: prize_amount + donation_pool_usdt
CREATE OR REPLACE FUNCTION public.sync_prize_pool_with_donations()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.prize_pool_usdt := COALESCE(NEW.prize_amount, 0) + COALESCE(NEW.donation_pool_usdt, 0);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_prize_pool_insert ON public.giveaways;
CREATE TRIGGER trg_sync_prize_pool_insert
  BEFORE INSERT ON public.giveaways
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_prize_pool_with_donations();

DROP TRIGGER IF EXISTS trg_sync_prize_pool_update ON public.giveaways;
CREATE TRIGGER trg_sync_prize_pool_update
  BEFORE UPDATE ON public.giveaways
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_prize_pool_with_donations();

-- 3) Create contributions table for audit and overrides
CREATE TABLE IF NOT EXISTS public.giveaway_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(24,8) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USDT',
  note TEXT,
  split_platform NUMERIC(5,4) NOT NULL,
  split_creator NUMERIC(5,4) NOT NULL,
  split_prize NUMERIC(5,4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contribution_split_total_check CHECK (
    split_platform + split_creator + split_prize = 1
  )
);

CREATE INDEX IF NOT EXISTS idx_contrib_giveaway_created ON public.giveaway_contributions(giveaway_id, created_at);
CREATE INDEX IF NOT EXISTS idx_contrib_user_created ON public.giveaway_contributions(user_id, created_at);

-- 4) Row Level Security policies for contributions
ALTER TABLE public.giveaway_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_contributions ON public.giveaway_contributions;
CREATE POLICY select_contributions ON public.giveaway_contributions
  FOR SELECT
  USING (
    -- donor can view their own
    user_id = auth.uid()
    -- admins can view all
    OR EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
    -- creator of the giveaway can view all contributions for their giveaway
    OR EXISTS (
      SELECT 1 FROM public.giveaways g
      WHERE g.id = giveaway_contributions.giveaway_id AND g.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS insert_own_contribution ON public.giveaway_contributions;
CREATE POLICY insert_own_contribution ON public.giveaway_contributions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- No updates or deletes by default (auditable, immutable). Add admin-only policies later if needed.

-- 5) RPC: apply_giveaway_donation
-- Applies a donation amount with either default giveaway split or override, updates totals atomically,
-- inserts into contributions, logs giveaway_audit, and returns computed breakdown and updated totals.
CREATE OR REPLACE FUNCTION public.apply_giveaway_donation(
  p_giveaway_id UUID,
  p_user_id UUID,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'USDT',
  p_note TEXT DEFAULT NULL,
  p_override_split_platform NUMERIC DEFAULT NULL,
  p_override_split_creator NUMERIC DEFAULT NULL,
  p_override_split_prize NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  pool_amount NUMERIC,
  creator_amount NUMERIC,
  platform_amount NUMERIC,
  donation_pool_total NUMERIC,
  creator_earnings_total NUMERIC,
  platform_earnings_total NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_platform NUMERIC(5,4);
  v_creator NUMERIC(5,4);
  v_prize NUMERIC(5,4);
  v_status TEXT;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be greater than zero';
  END IF;

  -- Ensure giveaway is active (not completed/cancelled)
  SELECT status INTO v_status FROM public.giveaways WHERE id = p_giveaway_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Giveaway % does not exist', p_giveaway_id;
  END IF;
  IF v_status IN ('completed','cancelled') THEN
    RAISE EXCEPTION 'Donations are not allowed for giveaway with status %', v_status;
  END IF;

  -- Determine effective split
  IF p_override_split_platform IS NOT NULL OR p_override_split_creator IS NOT NULL OR p_override_split_prize IS NOT NULL THEN
    IF p_override_split_platform IS NULL OR p_override_split_creator IS NULL OR p_override_split_prize IS NULL THEN
      RAISE EXCEPTION 'Override splits must provide all three values';
    END IF;
    IF p_override_split_platform + p_override_split_creator + p_override_split_prize <> 1 THEN
      RAISE EXCEPTION 'Override split must sum to exactly 1';
    END IF;
    v_platform := p_override_split_platform;
    v_creator := p_override_split_creator;
    v_prize := p_override_split_prize;
  ELSE
    SELECT donation_split_platform, donation_split_creator, donation_split_prize
    INTO v_platform, v_creator, v_prize
    FROM public.giveaways
    WHERE id = p_giveaway_id;

    IF v_platform + v_creator + v_prize <> 1 THEN
      RAISE EXCEPTION 'Giveaway split misconfigured: sum is not 1';
    END IF;
  END IF;

  pool_amount := p_amount * v_prize;
  creator_amount := p_amount * v_creator;
  platform_amount := p_amount * v_platform;

  -- Update totals atomically
  UPDATE public.giveaways
  SET donation_pool_usdt = donation_pool_usdt + pool_amount,
      creator_earnings_usdt = creator_earnings_usdt + creator_amount,
      platform_earnings_usdt = platform_earnings_usdt + platform_amount,
      updated_at = NOW()
  WHERE id = p_giveaway_id
  RETURNING donation_pool_usdt, creator_earnings_usdt, platform_earnings_usdt
  INTO donation_pool_total, creator_earnings_total, platform_earnings_total;

  -- Insert contribution audit row
  INSERT INTO public.giveaway_contributions (
    giveaway_id, user_id, amount, currency, note, split_platform, split_creator, split_prize
  ) VALUES (
    p_giveaway_id, p_user_id, p_amount, p_currency, p_note, v_platform, v_creator, v_prize
  );

  -- Log audit trail
  INSERT INTO public.giveaway_audit (giveaway_id, action, actor_id, note)
  VALUES (p_giveaway_id, 'donation_received', p_user_id, 
    format('Donation %s %s: platform=%s, creator=%s, prize=%s', p_amount, p_currency, platform_amount, creator_amount, pool_amount)
  );

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_giveaway_donation(UUID, UUID, NUMERIC, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC) TO authenticated;

COMMENT ON FUNCTION public.apply_giveaway_donation(UUID, UUID, NUMERIC, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC) IS 'Applies a donation with split, updates totals, inserts contribution, logs audit, and returns breakdown & totals.';