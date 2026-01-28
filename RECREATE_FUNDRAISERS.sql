-- Recreate Fundraisers Tables in Public Schema (Copying Giveaways Pattern)
-- This mirrors the working setup from giveaways
-- Run this in Supabase SQL Editor

-- Drop old tables from onagui schema if they exist (CASCADE will drop triggers automatically)
DROP TABLE IF EXISTS onagui.fundraiser_comments CASCADE;
DROP TABLE IF EXISTS onagui.fundraiser_updates CASCADE;
DROP TABLE IF EXISTS onagui.donations CASCADE;
DROP TABLE IF EXISTS onagui.fundraisers CASCADE;

-- Drop old tables from public schema if they exist (to start fresh)
DROP TABLE IF EXISTS public.fundraiser_comments CASCADE;
DROP TABLE IF EXISTS public.fundraiser_updates CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.fundraisers CASCADE;

-- Create Fundraisers Table in PUBLIC schema (like giveaways)
CREATE TABLE public.fundraisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Basic Info
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Financial
  goal_amount NUMERIC(24, 8) NOT NULL DEFAULT 0,
  raised_amount NUMERIC(24, 8) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USDC',
  
  -- Media
  cover_image TEXT,
  images TEXT[],
  video_url TEXT,
  
  -- Location
  location TEXT,
  country TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Beneficiary
  beneficiary_name TEXT,
  beneficiary_relationship TEXT,
  
  -- Crypto Wallet
  wallet_address TEXT NOT NULL,
  
  -- Metadata
  tags TEXT[],
  total_donations INTEGER DEFAULT 0,
  total_donors INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Create Donations Table in PUBLIC schema
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES public.fundraisers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Donation Details
  amount NUMERIC(24, 8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  
  -- Donor Info
  donor_name TEXT,
  donor_email TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT,
  
  -- Crypto Transaction
  transaction_hash TEXT UNIQUE,
  wallet_address TEXT NOT NULL,
  blockchain TEXT NOT NULL DEFAULT 'polygon',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Fundraiser Updates Table in PUBLIC schema
CREATE TABLE public.fundraiser_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES public.fundraisers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Comments Table in PUBLIC schema
CREATE TABLE public.fundraiser_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES public.fundraisers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  comment TEXT NOT NULL,
  donor_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Wallets Table in PUBLIC schema (if not exists)
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_fiat NUMERIC(24, 8) DEFAULT 0,
  balance_tickets INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_fundraisers_user_id ON public.fundraisers(user_id);
CREATE INDEX idx_fundraisers_status ON public.fundraisers(status);
CREATE INDEX idx_fundraisers_created_at ON public.fundraisers(created_at DESC);
CREATE INDEX idx_donations_fundraiser_id ON public.donations(fundraiser_id);
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_fundraiser_updates_fundraiser_id ON public.fundraiser_updates(fundraiser_id);
CREATE INDEX idx_fundraiser_comments_fundraiser_id ON public.fundraiser_comments(fundraiser_id);

-- Enable RLS (like giveaways)
ALTER TABLE public.fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraiser_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraiser_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (like giveaways - everyone can view, anyone can create)
CREATE POLICY "Anyone can view fundraisers"
  ON public.fundraisers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create fundraisers"
  ON public.fundraisers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update fundraisers"
  ON public.fundraisers FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can view donations"
  ON public.donations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view updates"
  ON public.fundraiser_updates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create updates"
  ON public.fundraiser_updates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view comments"
  ON public.fundraiser_comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON public.fundraiser_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view wallets"
  ON public.wallets FOR SELECT
  USING (true);

CREATE POLICY "Users can update wallets"
  ON public.wallets FOR UPDATE
  USING (true);

-- Create update_updated_at function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Triggers for updated_at
CREATE TRIGGER update_fundraisers_updated_at
  BEFORE UPDATE ON public.fundraisers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fundraiser_updates_updated_at
  BEFORE UPDATE ON public.fundraiser_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update fundraiser raised amount when donation is confirmed
CREATE OR REPLACE FUNCTION update_fundraiser_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE public.fundraisers
    SET 
      raised_amount = raised_amount + NEW.amount,
      total_donations = total_donations + 1,
      updated_at = NOW()
    WHERE id = NEW.fundraiser_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to count unique donors
CREATE OR REPLACE FUNCTION update_fundraiser_donor_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE public.fundraisers
    SET total_donors = (
      SELECT COUNT(DISTINCT COALESCE(user_id::text, wallet_address))
      FROM public.donations
      WHERE fundraiser_id = NEW.fundraiser_id AND status = 'confirmed'
    )
    WHERE id = NEW.fundraiser_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Triggers for donations
CREATE TRIGGER on_donation_confirmed
  AFTER INSERT OR UPDATE OF status ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_fundraiser_raised_amount();

CREATE TRIGGER on_donation_confirmed_update_donors
  AFTER INSERT OR UPDATE OF status ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_fundraiser_donor_count();

-- Create function to ensure user has a wallet
CREATE OR REPLACE FUNCTION ensure_user_wallet(user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance_fiat, balance_tickets)
  VALUES (user_uuid, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.fundraisers TO postgres, anon, authenticated;
GRANT ALL ON public.donations TO postgres, anon, authenticated;
GRANT ALL ON public.fundraiser_updates TO postgres, anon, authenticated;
GRANT ALL ON public.fundraiser_comments TO postgres, anon, authenticated;
GRANT ALL ON public.wallets TO postgres, anon, authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_wallet(UUID) TO anon, authenticated;

-- Verify tables exist
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name IN ('fundraisers', 'donations', 'fundraiser_updates', 'fundraiser_comments', 'wallets')
  AND table_schema = 'public'
ORDER BY table_name;
