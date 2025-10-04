-- Create platform_wallets table for storing the hot wallet information
CREATE TABLE IF NOT EXISTS platform_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency TEXT NOT NULL,
  address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(currency)
);

-- Create transactions table for the ledger
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'payout')),
  amount DECIMAL(24, 8) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  tx_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Create index on tx_hash for faster blockchain monitoring
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);

-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table for storing user tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  raffle_id UUID NOT NULL,
  ticket_number TEXT NOT NULL,
  purchase_transaction_id UUID REFERENCES transactions(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'used', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id and raffle_id for faster queries
CREATE INDEX IF NOT EXISTS idx_tickets_user_raffle ON tickets(user_id, raffle_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_platform_wallets_updated_at
BEFORE UPDATE ON platform_wallets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE platform_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Only allow admins to access platform_wallets
CREATE POLICY admin_platform_wallets ON platform_wallets
  FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

-- Allow users to view their own transactions
CREATE POLICY user_transactions_select ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to manage all transactions
CREATE POLICY admin_transactions ON transactions
  FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

-- Only allow admins to access audit logs
CREATE POLICY admin_audit_logs ON audit_logs
  FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

-- Allow users to view their own tickets
CREATE POLICY user_tickets_select ON tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to manage all tickets
CREATE POLICY admin_tickets ON tickets
  FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));