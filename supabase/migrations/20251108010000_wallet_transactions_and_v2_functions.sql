-- =========================================================
-- 20251108_wallet_transactions_and_v2_functions.sql
-- Add wallet_transactions ledger and define v2 RPCs with improvements
-- - buy_giveaway_tickets_v2: FOR UPDATE on giveaways, precision-safe casting, ledger
-- - apply_giveaway_donation_with_wallet_v2: precision-safe casting, ledger
-- =========================================================

-- 1) Wallet transactions ledger table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount_usd NUMERIC(18,6) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('debit','credit')),
  reason TEXT NOT NULL,
  reference_id UUID,
  balance_after NUMERIC(18,6) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created
  ON public.wallet_transactions(user_id, created_at DESC);

COMMENT ON TABLE public.wallet_transactions IS 'Ledger of wallet movements (debits/credits) with references to purchases/contributions.';

-- 2) V2: buy_giveaway_tickets with row locking and precision-safe casting
CREATE OR REPLACE FUNCTION public.buy_giveaway_tickets_v2(
  p_giveaway_id UUID,
  p_user_id UUID,
  p_quantity INTEGER
)
RETURNS TABLE (
  purchase_id UUID,
  new_balance_usd NUMERIC,
  total_cost_usd NUMERIC,
  issued_tickets INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_price NUMERIC(24,8);
  v_status TEXT;
  v_balance NUMERIC(18,6);
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'invalid_quantity';
  END IF;

  -- Validate and lock giveaway row to avoid race conditions on counters/availability
  SELECT ticket_price, status
  INTO v_ticket_price, v_status
  FROM public.giveaways
  WHERE id = p_giveaway_id
  FOR UPDATE;

  IF v_ticket_price IS NULL OR v_ticket_price <= 0 THEN
    RAISE EXCEPTION 'price_not_configured';
  END IF;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'giveaway_not_found';
  END IF;
  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'giveaway_inactive';
  END IF;

  -- Precision-safe total cost
  total_cost_usd := (v_ticket_price::numeric(24,8) * p_quantity)::numeric(18,6);

  -- Lock wallet row and validate balance
  SELECT fiat_balance_usd
  INTO v_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'wallet_not_found';
  END IF;
  IF v_balance < total_cost_usd THEN
    RAISE EXCEPTION 'insufficient_balance';
  END IF;

  -- Deduct balance (cast to consistent scale)
  UPDATE public.wallets
  SET fiat_balance_usd = (v_balance - total_cost_usd)::numeric(18,6),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  new_balance_usd := (v_balance - total_cost_usd)::numeric(18,6);

  -- Insert tickets in batch
  INSERT INTO public.tickets (user_id, giveaway_id, is_free)
  SELECT p_user_id, p_giveaway_id, false
  FROM generate_series(1, p_quantity);

  issued_tickets := p_quantity;

  -- Update giveaways.tickets_count for quick reads
  UPDATE public.giveaways
  SET tickets_count = COALESCE(tickets_count, 0) + p_quantity,
      updated_at = NOW()
  WHERE id = p_giveaway_id;

  -- Insert audit row
  INSERT INTO public.ticket_purchases (
    user_id, giveaway_id, quantity, unit_price_usd, total_usd, wallet_balance_after
  ) VALUES (
    p_user_id, p_giveaway_id, p_quantity, v_ticket_price, total_cost_usd, new_balance_usd
  ) RETURNING id, created_at INTO purchase_id, created_at;

  -- Ledger: record debit for ticket purchase
  INSERT INTO public.wallet_transactions (
    user_id, amount_usd, type, reason, reference_id, balance_after
  ) VALUES (
    p_user_id, total_cost_usd, 'debit', 'ticket_purchase', purchase_id, new_balance_usd
  );

  RETURN;
END;
$$;

COMMENT ON FUNCTION public.buy_giveaway_tickets_v2(UUID, UUID, INTEGER)
IS 'Atomic purchase v2: locks giveaway, precision-safe cost, deducts wallet, inserts tickets, updates count, logs purchase, and ledger debit.';

-- 3) V2: donation via wallet with ledger
CREATE OR REPLACE FUNCTION public.apply_giveaway_donation_with_wallet_v2(
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
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  -- Lock wallet row and validate balance
  SELECT fiat_balance_usd
  INTO v_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'wallet_not_found';
  END IF;
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_balance';
  END IF;

  -- Deduct balance first (cast to consistent scale)
  UPDATE public.wallets
  SET fiat_balance_usd = (v_balance - p_amount)::numeric(18,6),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  new_balance_usd := (v_balance - p_amount)::numeric(18,6);

  -- Apply donation with split and audit via existing function
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

  -- Ledger: record debit for donation
  INSERT INTO public.wallet_transactions (
    user_id, amount_usd, type, reason, reference_id, balance_after
  ) VALUES (
    p_user_id, p_amount, 'debit', 'donation', contribution_id, new_balance_usd
  );

  RETURN;
END;
$$;

COMMENT ON FUNCTION public.apply_giveaway_donation_with_wallet_v2(UUID, UUID, NUMERIC, TEXT, NUMERIC, NUMERIC, NUMERIC)
IS 'Donation v2: deducts wallet with precision, calls base donation for split & audit, and writes ledger debit.';