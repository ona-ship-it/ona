-- 1. Enable Extensions & Schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS onagui;

-- 2. Create core profiles table (Public)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT,
  userType TEXT,
  isVerified BOOLEAN DEFAULT FALSE,
  linkX BOOLEAN DEFAULT FALSE,
  balance TEXT,
  currency TEXT DEFAULT 'USD',
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  referralCode TEXT,
  referralCount INTEGER DEFAULT 0,
  completedAchievements TEXT[] DEFAULT '{}'::TEXT[]
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Fix trigger function syntax (using COALESCE instead of OR)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'preferred_username', SPLIT_PART(new.email, '@', 1)), 
    new.raw_user_meta_data->>'avatar_url', 
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Create Crypto/Wallet Tables (20240729_crypto_ledger.sql)
CREATE TABLE IF NOT EXISTS platform_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL,
  address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(currency)
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'payout', 'ticket', 'withdraw')), 
  amount DECIMAL(24, 8) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  tx_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Giveaways Table (Missing from migrations)
CREATE TABLE IF NOT EXISTS giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id),
  title TEXT,
  description TEXT,
  prize_amount DECIMAL,
  prize_pool_usdt DECIMAL,
  ticket_price DECIMAL,
  photo_url TEXT,
  media_url TEXT,
  ends_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  is_active BOOLEAN DEFAULT false,
  escrow_amount DECIMAL,
  tickets_count INTEGER DEFAULT 0,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  raffle_id UUID, -- Optional as it might be giveaway_id
  giveaway_id UUID REFERENCES giveaways(id),
  ticket_number TEXT NOT NULL,
  purchase_transaction_id UUID REFERENCES transactions(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'used', 'expired', 'pending', 'completed', 'refunded')),
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_raffle ON tickets(user_id, giveaway_id);

-- 5. Ranks, Achievements & Gamification (20240801_user_ranks_achievements.sql)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onagui_user_type') THEN 
    CREATE TYPE onagui_user_type AS ENUM ('vip', 'active', 'empowered', 'signed_in', 'subscriber', 'admin'); 
  END IF; 
END; 
$$;

CREATE TABLE IF NOT EXISTS ranks ( 
  code text PRIMARY KEY, 
  name text NOT NULL, 
  description text, 
  requirements jsonb, 
  badge_icon text 
); 

INSERT INTO ranks (code, name, description, requirements, badge_icon) VALUES 
('new_user', 'New User', 'Entry rank', '{"max_days": 3}', '🎟️'),
('subscriber', 'Subscriber', 'Verified user', '{"min_verifications": 3}', '🔐'),
('onagui_user', 'Active User', 'KYC + active participation', '{"kyc": true}', '💎'),
('powered', 'Powered by Onagui', 'Verified influencer', '{"min_successful_giveaways": 3}', '⚡'),
('vip', 'Onagui VIP', 'Invite-only elite rank', '{"invite_only": true}', '👑') 
ON CONFLICT (code) DO NOTHING;

-- App Residents (Alternative Profile Table - Keep for compatibility)
CREATE TABLE IF NOT EXISTS onagui.app_users ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  email text UNIQUE, 
  username text UNIQUE, 
  profile_image text, 
  current_rank text REFERENCES ranks(code) DEFAULT 'new_user', 
  reputation_points int DEFAULT 0, 
  created_at timestamptz DEFAULT now(), 
  last_active_at timestamptz 
); 

-- 6. RLS Policies (Safe Drops)
ALTER TABLE platform_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating
DROP POLICY IF EXISTS user_transactions_select ON transactions;
DROP POLICY IF EXISTS user_tickets_select ON tickets;
DROP POLICY IF EXISTS view_giveaways ON giveaways;

-- Re-create Policies
CREATE POLICY user_transactions_select ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_tickets_select ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY view_giveaways ON giveaways FOR SELECT USING (true);

-- 7. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_platform_wallets_updated_at ON platform_wallets;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
DROP TRIGGER IF EXISTS update_giveaways_updated_at ON giveaways;

CREATE TRIGGER update_platform_wallets_updated_at BEFORE UPDATE ON platform_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_giveaways_updated_at BEFORE UPDATE ON giveaways FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- End of Setup Script
