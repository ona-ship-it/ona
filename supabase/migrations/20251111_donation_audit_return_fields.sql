-- =========================================================
-- 20251107_donation_audit_return_fields.sql
-- Extend donation RPCs to return contribution audit id and timestamp
-- =========================================================

-- 1) Update base donation function to return audit fields
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
  platform_earnings_total NUMERIC,
  contribution_id UUID,
  contribution_created_at TIMESTAMPTZ
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

  SELECT status INTO v_status FROM public.giveaways WHERE id = p_giveaway_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Giveaway % does not exist', p_giveaway_id;
  END IF;
  IF v_status IN ('completed','cancelled') THEN
    RAISE EXCEPTION 'Donations are not allowed for giveaway with status %', v_status;
  END IF;

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

  UPDATE public.giveaways
  SET donation_pool_usdt = donation_pool_usdt + pool_amount,
      creator_earnings_usdt = creator_earnings_usdt + creator_amount,
      platform_earnings_usdt = platform_earnings_usdt + platform_amount,
      updated_at = NOW()
  WHERE id = p_giveaway_id
  RETURNING donation_pool_usdt, creator_earnings_usdt, platform_earnings_usdt
  INTO donation_pool_total, creator_earnings_total, platform_earnings_total;

  INSERT INTO public.giveaway_contributions (
    giveaway_id, user_id, amount, currency, note, split_platform, split_creator, split_prize
  ) VALUES (
    p_giveaway_id, p_user_id, p_amount, p_currency, p_note, v_platform, v_creator, v_prize
  ) RETURNING id, created_at INTO contribution_id, contribution_created_at;

  INSERT INTO public.giveaway_audit (giveaway_id, action, actor_id, note)
  VALUES (p_giveaway_id, 'donation_received', p_user_id,
    format('Donation %s %s: platform=%s, creator=%s, prize=%s', p_amount, p_currency, platform_amount, creator_amount, pool_amount)
  );

  RETURN;
END;
$$;

COMMENT ON FUNCTION public.apply_giveaway_donation(UUID, UUID, NUMERIC, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC)
IS 'Applies a donation with split, updates totals, inserts contribution, logs audit, and returns breakdown, totals, and contribution audit id/timestamp.';

-- 2) Update wallet-wrapped donation function to propagate audit fields
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
  platform_earnings_total NUMERIC,
  contribution_id UUID,
  contribution_created_at TIMESTAMPTZ
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

  UPDATE public.wallets
  SET fiat_balance_usd = v_balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  new_balance_usd := v_balance - p_amount;

  SELECT
    t.pool_amount,
    t.creator_amount,
    t.platform_amount,
    t.donation_pool_total,
    t.creator_earnings_total,
    t.platform_earnings_total,
    t.contribution_id,
    t.contribution_created_at
  INTO
    pool_amount,
    creator_amount,
    platform_amount,
    donation_pool_total,
    creator_earnings_total,
    platform_earnings_total,
    contribution_id,
    contribution_created_at
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
IS 'Atomic donation: deducts wallet fiat_balance_usd then applies donation split & audit; returns breakdown, totals, new wallet balance, and contribution audit id/timestamp.';