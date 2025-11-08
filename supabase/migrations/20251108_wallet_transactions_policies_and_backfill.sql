-- =========================================================
-- 20251108_wallet_transactions_policies_and_backfill.sql
-- RLS policies for wallet_transactions and historical backfill
-- =========================================================

-- Ensure table exists; adjust column for backfill nullability
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'wallet_transactions' AND column_name = 'balance_after'
  ) THEN
    -- Allow NULL for balance_after to support backfill when historical balance is unknown
    ALTER TABLE public.wallet_transactions ALTER COLUMN balance_after DROP NOT NULL;
  END IF;
END $$;

-- Enable RLS on wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can view their own ledger entries
DROP POLICY IF EXISTS wallet_tx_select_self ON public.wallet_transactions;
CREATE POLICY wallet_tx_select_self ON public.wallet_transactions
  FOR SELECT
  TO authenticated
  USING (
    user_id = coalesce(current_setting('jwt.claims.sub', true)::uuid, auth.uid()::uuid)
  );

-- Policy: service role can insert/update/delete (server-side writes only)
DROP POLICY IF EXISTS wallet_tx_sr_manage ON public.wallet_transactions;
CREATE POLICY wallet_tx_sr_manage ON public.wallet_transactions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Backfill donations into wallet_transactions from giveaway_contributions
INSERT INTO public.wallet_transactions (
  user_id, amount_usd, type, reason, reference_id, balance_after, metadata, created_at
)
SELECT
  gc.user_id,
  gc.amount::numeric(18,6) AS amount_usd,
  'debit' AS type,
  'donation' AS reason,
  gc.id AS reference_id,
  NULL::numeric(18,6) AS balance_after,
  jsonb_build_object('currency', gc.currency, 'note', gc.note, 'giveaway_id', gc.giveaway_id) AS metadata,
  gc.created_at
FROM public.giveaway_contributions gc
WHERE NOT EXISTS (
  SELECT 1 FROM public.wallet_transactions wt
  WHERE wt.reference_id = gc.id AND wt.reason = 'donation'
);

-- Backfill ticket purchases into wallet_transactions from ticket_purchases
INSERT INTO public.wallet_transactions (
  user_id, amount_usd, type, reason, reference_id, balance_after, metadata, created_at
)
SELECT
  tp.user_id,
  tp.total_usd::numeric(18,6) AS amount_usd,
  'debit' AS type,
  'ticket_purchase' AS reason,
  tp.id AS reference_id,
  tp.wallet_balance_after::numeric(18,6) AS balance_after,
  jsonb_build_object('quantity', tp.quantity, 'unit_price_usd', tp.unit_price_usd, 'giveaway_id', tp.giveaway_id) AS metadata,
  tp.created_at
FROM public.ticket_purchases tp
WHERE NOT EXISTS (
  SELECT 1 FROM public.wallet_transactions wt
  WHERE wt.reference_id = tp.id AND wt.reason = 'ticket_purchase'
);

COMMENT ON POLICY wallet_tx_select_self ON public.wallet_transactions IS 'Allow authenticated users to SELECT their own wallet_transactions rows.';
COMMENT ON POLICY wallet_tx_sr_manage ON public.wallet_transactions IS 'Restrict writes to wallet_transactions to service_role or definer functions.';