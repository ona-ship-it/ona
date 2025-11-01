-- Add USDT fiat balance column to wallets table
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS fiat_balance_usd DECIMAL(18,6) DEFAULT 0;

-- Update fiat_transactions table to include USDT conversion fields
ALTER TABLE fiat_transactions ADD COLUMN IF NOT EXISTS amount_usd DECIMAL(18,6);
ALTER TABLE fiat_transactions ADD COLUMN IF NOT EXISTS usdt_rate DECIMAL(18,6) DEFAULT 1.00;

-- Update existing fiat_transactions records to have amount_usd
UPDATE fiat_transactions 
SET amount_usd = amount 
WHERE amount_usd IS NULL;

-- Make amount_usd NOT NULL after updating existing records
ALTER TABLE fiat_transactions ALTER COLUMN amount_usd SET NOT NULL;

-- Add index for better performance on fiat_balance_usd
CREATE INDEX IF NOT EXISTS idx_wallets_fiat_balance_usd ON public.wallets(fiat_balance_usd);

-- Add comment to clarify the purpose
COMMENT ON COLUMN public.wallets.fiat_balance_usd IS 'Fiat balance converted to USDT equivalent for unified wallet display';
COMMENT ON COLUMN fiat_transactions.amount_usd IS 'Original fiat amount in USD';
COMMENT ON COLUMN fiat_transactions.usdt_rate IS 'USD to USDT conversion rate at time of transaction';