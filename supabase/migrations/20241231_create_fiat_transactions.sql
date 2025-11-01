-- Create fiat_transactions table for Stripe payment tracking
CREATE TABLE fiat_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraint to users table if it exists
-- ALTER TABLE fiat_transactions ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Create index for faster queries
CREATE INDEX idx_fiat_transactions_user_id ON fiat_transactions(user_id);
CREATE INDEX idx_fiat_transactions_status ON fiat_transactions(status);
CREATE INDEX idx_fiat_transactions_stripe_payment_intent_id ON fiat_transactions(stripe_payment_intent_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE fiat_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
CREATE POLICY "Users can view own fiat transactions" ON fiat_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Only authenticated users can insert transactions (for webhook)
CREATE POLICY "Authenticated users can insert fiat transactions" ON fiat_transactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR current_setting('role') = 'service_role');

-- Policy: Only service role can update transactions (for webhook)
CREATE POLICY "Service role can update fiat transactions" ON fiat_transactions
  FOR UPDATE USING (current_setting('role') = 'service_role');