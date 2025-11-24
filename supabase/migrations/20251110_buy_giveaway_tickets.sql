-- =========================================================
-- 20251107_buy_giveaway_tickets.sql
-- Atomic ticket purchase: balance check, deduction, ticket insert
-- Server-side only (intended to be called with service role key)
-- =========================================================

CREATE OR REPLACE FUNCTION public.buy_giveaway_tickets(
  p_giveaway_id UUID,
  p_user_id UUID,
  p_quantity INTEGER
)
RETURNS TABLE (
  new_balance_usd NUMERIC,
  total_cost_usd NUMERIC,
  issued_tickets INTEGER
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
    RAISE EXCEPTION 'Quantity must be greater than zero';
  END IF;

  -- Validate giveaway
  SELECT ticket_price, status
  INTO v_ticket_price, v_status
  FROM public.giveaways
  WHERE id = p_giveaway_id;

  IF v_ticket_price IS NULL OR v_ticket_price <= 0 THEN
    RAISE EXCEPTION 'Giveaway price not configured';
  END IF;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Giveaway % not found', p_giveaway_id;
  END IF;
  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'Giveaway is not active';
  END IF;

  total_cost_usd := v_ticket_price * p_quantity;

  -- Lock wallet row and validate balance
  SELECT fiat_balance_usd
  INTO v_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;
  IF v_balance < total_cost_usd THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Deduct balance
  UPDATE public.wallets
  SET fiat_balance_usd = v_balance - total_cost_usd,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  new_balance_usd := v_balance - total_cost_usd;

  -- Insert tickets in batch
  INSERT INTO public.tickets (user_id, giveaway_id, is_free)
  SELECT p_user_id, p_giveaway_id, false
  FROM generate_series(1, p_quantity);

  issued_tickets := p_quantity;

  -- Optionally update giveaways.tickets_count for quick reads
  UPDATE public.giveaways
  SET tickets_count = COALESCE(tickets_count, 0) + p_quantity,
      updated_at = NOW()
  WHERE id = p_giveaway_id;

  RETURN;
END;
$$;

COMMENT ON FUNCTION public.buy_giveaway_tickets(UUID, UUID, INTEGER) IS 'Atomic purchase: validates giveaway, deducts wallet fiat_balance_usd, inserts tickets, updates tickets_count.';

-- Intentionally no GRANT to authenticated/public; intended for server-side calls only.