-- =========================================================
-- 20251107_apply_giveaway_donation_with_wallet.sql
-- Atomic donation: deduct wallet then apply donation split & audit
-- Calls existing public.apply_giveaway_donation for split & totals
-- =========================================================

CREATE OR REPLACE FUNCTION public.apply_giveaway_donation_with_wallet(
  p_giveaway_id UUID,
  p_user_id UUID,
  p_amount NUMERIC,
  p_note TEXT DEFAULT NULL,
  p_override_split_platform NUMERIC DEFAULT NULL,
  p_override_split_creator NUMERIC DEFAULT NULL,
  p_override_split_prize NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  new_balance_usd NUMERIC,
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
  v_balance NUMERIC(18,6);
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be greater than zero';
  END IF;

  -- Lock wallet row and validate balance
  SELECT fiat_balance_usd
  INTO v_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Deduct balance first
  UPDATE public.wallets
  SET fiat_balance_usd = v_balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  new_balance_usd := v_balance - p_amount;

  -- Apply donation with split and audit via existing function
  SELECT
    t.pool_amount,
    t.creator_amount,
    t.platform_amount,
    t.donation_pool_total,
    t.creator_earnings_total,
    t.platform_earnings_total
  INTO
    pool_amount,
    creator_amount,
    platform_amount,
    donation_pool_total,
    creator_earnings_total,
    platform_earnings_total
  FROM public.apply_giveaway_donation(
    p_giveaway_id,
    p_user_id,
    p_amount,
    'USDT',
    p_note,
    p_override_split_platform,
    p_override_split_creator,
    p_override_split_prize
  ) AS t;

  RETURN;
END;
$$;

COMMENT ON FUNCTION public.apply_giveaway_donation_with_wallet(UUID, UUID, NUMERIC, TEXT, NUMERIC, NUMERIC, NUMERIC)
IS 'Atomic donation: deducts wallet fiat_balance_usd then applies donation split & audit using apply_giveaway_donation; returns breakdown, totals, and new wallet balance.';