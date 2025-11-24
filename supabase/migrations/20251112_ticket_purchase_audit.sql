-- =========================================================
-- 20251107_ticket_purchase_audit.sql
-- Create ticket_purchases audit table and update RPC to log purchases
-- =========================================================

-- 1) Audit table for ticket purchases
CREATE TABLE IF NOT EXISTS public.ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_usd NUMERIC(24,8) NOT NULL CHECK (unit_price_usd > 0),
  total_usd NUMERIC(24,8) NOT NULL CHECK (total_usd > 0),
  wallet_balance_after NUMERIC(18,6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_purchases_user_created ON public.ticket_purchases(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_giveaway_created ON public.ticket_purchases(giveaway_id, created_at);

ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_ticket_purchases ON public.ticket_purchases;
CREATE POLICY select_own_ticket_purchases ON public.ticket_purchases
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS admin_ticket_purchases ON public.ticket_purchases;
CREATE POLICY admin_ticket_purchases ON public.ticket_purchases
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

-- 2) Update RPC to log purchases and return audit info
CREATE OR REPLACE FUNCTION public.buy_giveaway_tickets(
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

  RETURN;
END;
$$;

COMMENT ON FUNCTION public.buy_giveaway_tickets(UUID, UUID, INTEGER) IS 'Atomic purchase with audit: validates giveaway, deducts wallet fiat_balance_usd, inserts tickets, updates tickets_count, logs ticket_purchases, and returns audit info.';