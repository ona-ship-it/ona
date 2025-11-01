-- =========================================================
-- 🗃️ WALLET SYSTEM TABLES: MANUAL MIGRATION
-- =========================================================
-- Execute this SQL in Supabase Dashboard > SQL Editor

-- 1️⃣ Create user_wallets table
CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  network varchar NOT NULL, -- 'ethereum','solana'
  address text NOT NULL,
  encrypted_private_key text, -- nullable if custodial by platform
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, network)
);

-- 2️⃣ Create deposit_transactions table
CREATE TABLE IF NOT EXISTS deposit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  network varchar NOT NULL,
  tx_hash text NOT NULL UNIQUE,
  from_address text,
  to_address text,
  amount numeric(24,8) NOT NULL,
  currency varchar NOT NULL, -- 'USDT','ETH', etc
  confirmations integer DEFAULT 0,
  status varchar DEFAULT 'pending', -- pending/confirmed/failed
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3️⃣ Create deposit_scan_status table
CREATE TABLE IF NOT EXISTS deposit_scan_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network varchar NOT NULL UNIQUE,
  last_scanned_block bigint DEFAULT 0,
  last_scanned_tx timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4️⃣ Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric(24,8) NOT NULL,
  currency varchar NOT NULL DEFAULT 'USDT',
  to_address text NOT NULL,
  status varchar NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  tx_hash text,
  idempotency_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5️⃣ Add role column to app_users
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 6️⃣ Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_network ON user_wallets(network);
CREATE INDEX IF NOT EXISTS idx_deposit_transactions_user_id ON deposit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_transactions_tx_hash ON deposit_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_deposit_transactions_status ON deposit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

-- 7️⃣ Enable RLS (Row Level Security)
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_scan_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- 8️⃣ Create basic RLS policies
-- User wallet policies
CREATE POLICY "Users can view their own wallets" ON user_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets" ON user_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deposit transaction policies
CREATE POLICY "Users can view their own deposits" ON deposit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Withdrawal request policies
CREATE POLICY "Users can view their own withdrawals" ON withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawals" ON withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (simplified - check if user has admin role)
CREATE POLICY "Service role can manage all wallets" ON user_wallets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all deposits" ON deposit_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all withdrawals" ON withdrawal_requests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage scan status" ON deposit_scan_status
  FOR ALL USING (auth.role() = 'service_role');

-- ✅ Migration complete! 
-- Tables created: user_wallets, deposit_transactions, deposit_scan_status, withdrawal_requests
-- Column added: app_users.role
-- Indexes and RLS policies applied