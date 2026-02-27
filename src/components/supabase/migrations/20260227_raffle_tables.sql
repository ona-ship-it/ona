-- ============================================================================
-- ONAGUI RAFFLE SYSTEM — Database Tables
-- Run this in Supabase SQL Editor
-- ============================================================================

-- === RAFFLES TABLE ===
CREATE TABLE IF NOT EXISTS public.raffles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,  -- array of image URLs ["url1", "url2", ...]
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('vehicle', 'electronics', 'cash', 'luxury', 'real_estate', 'other')),
  
  -- Prize info
  prize_value NUMERIC(12,2) NOT NULL CHECK (prize_value > 0),
  prize_currency TEXT NOT NULL DEFAULT 'USD',
  proof_url TEXT,  -- link to official retailer showing price
  
  -- Ticket settings
  total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
  tickets_sold INTEGER NOT NULL DEFAULT 0 CHECK (tickets_sold >= 0),
  ticket_price NUMERIC(6,2) NOT NULL DEFAULT 1.00,  -- always 1 USDC
  max_per_user INTEGER NOT NULL DEFAULT 1100,
  
  -- Schedule
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Status: active, settling, kyc_pending, fulfilled, redrawing
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'settling', 'kyc_pending', 'fulfilled', 'redrawing', 'cancelled')),
  
  -- Treasury
  treasury_wallet TEXT,  -- on-chain wallet address for this raffle
  
  -- Creator
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Referral
  referral_enabled BOOLEAN NOT NULL DEFAULT false,
  referral_rate NUMERIC(4,2) DEFAULT 0 CHECK (referral_rate >= 0 AND referral_rate <= 5),  -- max 5%
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validate: total_tickets must be >= 110% of prize_value
ALTER TABLE public.raffles ADD CONSTRAINT raffle_min_tickets 
  CHECK (total_tickets >= CEIL(prize_value * 1.1));

-- Validate: end_date must be 7-90 days after start_date
ALTER TABLE public.raffles ADD CONSTRAINT raffle_duration 
  CHECK (end_date >= start_date + INTERVAL '7 days' AND end_date <= start_date + INTERVAL '90 days');


-- === RAFFLE TICKETS TABLE ===
CREATE TABLE IF NOT EXISTS public.raffle_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  transaction_hash TEXT,  -- on-chain tx hash
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_raffle ON public.raffle_tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_user ON public.raffle_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_raffle_user ON public.raffle_tickets(raffle_id, user_id);


-- === RAFFLE SETTLEMENTS TABLE ===
CREATE TABLE IF NOT EXISTS public.raffle_settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  
  -- Winner info
  winner_user_id UUID REFERENCES auth.users(id),
  winning_ticket_id UUID REFERENCES public.raffle_tickets(id),
  
  -- Randomness proof
  random_seed TEXT,
  selection_method TEXT DEFAULT 'crypto_random',  -- 'crypto_random' or 'chainlink_vrf'
  vrf_proof TEXT,  -- Chainlink VRF proof (when implemented)
  
  -- Scenario
  scenario TEXT NOT NULL CHECK (scenario IN ('sold_out', 'partial')),
  
  -- Revenue split
  total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  winner_payout NUMERIC(12,2) DEFAULT 0,
  onagui_payout NUMERIC(12,2) DEFAULT 0,
  creator_payout NUMERIC(12,2) DEFAULT 0,
  referral_payouts JSONB DEFAULT '{}'::jsonb,  -- {"user_id": amount, ...}
  
  -- Winner choice (sold out only)
  winner_choice TEXT CHECK (winner_choice IN ('prize', 'cash', 'pending')),
  cash_alternative_amount NUMERIC(12,2),
  
  -- KYC
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'passed', 'failed')),
  kyc_failure_reason TEXT,
  kyc_proof_url TEXT,  -- proof of KYC failure (if failed)
  
  -- Redraw tracking
  redraw_count INTEGER NOT NULL DEFAULT 0,
  previous_winners JSONB DEFAULT '[]'::jsonb,  -- array of failed winner user_ids
  
  -- Fulfillment
  fulfilled_at TIMESTAMPTZ,
  fulfillment_proof JSONB DEFAULT '{}'::jsonb,  -- {"tracking": "...", "receipt": "...", "photos": [...]}
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlements_raffle ON public.raffle_settlements(raffle_id);
CREATE INDEX IF NOT EXISTS idx_settlements_winner ON public.raffle_settlements(winner_user_id);


-- === RAFFLE REFERRALS TABLE ===
CREATE TABLE IF NOT EXISTS public.raffle_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id),  -- who shared the link
  buyer_user_id UUID NOT NULL REFERENCES auth.users(id),     -- who bought via the link
  ticket_id UUID NOT NULL REFERENCES public.raffle_tickets(id),
  commission_amount NUMERIC(8,4) NOT NULL DEFAULT 0,  -- USDC earned by referrer
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_raffle ON public.raffle_referrals(raffle_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.raffle_referrals(referrer_user_id);


-- === ROW LEVEL SECURITY ===

-- Raffles: anyone can read active raffles, only creator can create
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active raffles" ON public.raffles
  FOR SELECT USING (status != 'draft');

CREATE POLICY "Authenticated users can create raffles" ON public.raffles
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator can update own draft raffles" ON public.raffles
  FOR UPDATE USING (auth.uid() = creator_id AND status = 'draft');

-- Tickets: anyone can read, authenticated can buy
ALTER TABLE public.raffle_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view raffle tickets" ON public.raffle_tickets
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can buy tickets" ON public.raffle_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Settlements: public read, admin write
ALTER TABLE public.raffle_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settlements" ON public.raffle_settlements
  FOR SELECT USING (true);

-- Referrals: referrer can see their own
ALTER TABLE public.raffle_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.raffle_referrals
  FOR SELECT USING (auth.uid() = referrer_user_id);


-- === AUTO-UPDATE TIMESTAMPS ===
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER raffles_updated_at
  BEFORE UPDATE ON public.raffles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settlements_updated_at
  BEFORE UPDATE ON public.raffle_settlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- === FUNCTION: Check ticket purchase is valid ===
CREATE OR REPLACE FUNCTION check_raffle_ticket_purchase()
RETURNS TRIGGER AS $$
DECLARE
  raffle_record RECORD;
  user_existing_tickets INTEGER;
BEGIN
  -- Get raffle info
  SELECT * INTO raffle_record FROM public.raffles WHERE id = NEW.raffle_id;
  
  -- Check raffle is active
  IF raffle_record.status != 'active' THEN
    RAISE EXCEPTION 'Raffle is not active';
  END IF;
  
  -- Check raffle hasn't ended
  IF raffle_record.end_date < NOW() THEN
    RAISE EXCEPTION 'Raffle has ended';
  END IF;
  
  -- Check tickets available
  IF raffle_record.tickets_sold + NEW.quantity > raffle_record.total_tickets THEN
    RAISE EXCEPTION 'Not enough tickets available';
  END IF;
  
  -- Check user hasn't exceeded max per user
  SELECT COALESCE(SUM(quantity), 0) INTO user_existing_tickets
    FROM public.raffle_tickets
    WHERE raffle_id = NEW.raffle_id AND user_id = NEW.user_id;
  
  IF user_existing_tickets + NEW.quantity > raffle_record.max_per_user THEN
    RAISE EXCEPTION 'Exceeds maximum tickets per user (max: %)', raffle_record.max_per_user;
  END IF;
  
  -- Check creator is not buying own raffle tickets
  IF NEW.user_id = raffle_record.creator_id THEN
    RAISE EXCEPTION 'Creator cannot buy tickets to own raffle';
  END IF;
  
  -- Update tickets_sold count
  UPDATE public.raffles 
    SET tickets_sold = tickets_sold + NEW.quantity 
    WHERE id = NEW.raffle_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_ticket_purchase
  BEFORE INSERT ON public.raffle_tickets
  FOR EACH ROW EXECUTE FUNCTION check_raffle_ticket_purchase();
