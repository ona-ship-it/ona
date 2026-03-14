-- Add share_code to giveaways table
ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS share_code TEXT UNIQUE;
ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS share_url TEXT;
ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS total_shares INTEGER DEFAULT 0;
ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS giveaway_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID REFERENCES giveaways(id) ON DELETE CASCADE NOT NULL,
  referrer_id UUID REFERENCES auth.users(id), -- Creator or user who shared
  referred_user_id UUID REFERENCES auth.users(id), -- New user who signed up
  share_code TEXT NOT NULL,
  
  -- Tracking
  clicked_at TIMESTAMP WITH TIME ZONE,
  signed_up_at TIMESTAMP WITH TIME ZONE,
  ticket_claimed_at TIMESTAMP WITH TIME ZONE,
  ticket_id UUID REFERENCES tickets(id),
  
  -- Reward tracking
  referrer_rewarded BOOLEAN DEFAULT FALSE,
  reward_given_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create share_links table for custom share tracking
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID REFERENCES giveaways(id) ON DELETE CASCADE,
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  
  share_code TEXT UNIQUE NOT NULL,
  share_url TEXT NOT NULL,
  
  -- Who created this share link
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Analytics
  click_count INTEGER DEFAULT 0,
  signup_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0, -- How many actually entered/bought
  
  -- Metadata
  platform TEXT, -- 'twitter', 'instagram', 'facebook', 'whatsapp', 'direct'
  custom_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Add verification status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_method TEXT; -- 'email', 'phone', 'manual'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_giveaway_referrals_giveaway ON giveaway_referrals(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_referrals_referrer ON giveaway_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_referrals_referred ON giveaway_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_referrals_code ON giveaway_referrals(share_code);
CREATE INDEX IF NOT EXISTS idx_share_links_code ON share_links(share_code);
CREATE INDEX IF NOT EXISTS idx_share_links_creator ON share_links(creator_id);

-- RLS Policies
ALTER TABLE giveaway_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view referrals" ON giveaway_referrals FOR SELECT USING (true);
CREATE POLICY "System can insert referrals" ON giveaway_referrals FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view share links" ON share_links FOR SELECT USING (true);
CREATE POLICY "Users can create share links" ON share_links FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can view their share links" ON share_links FOR SELECT USING (auth.uid() = creator_id);

-- Function to generate unique share code
CREATE OR REPLACE FUNCTION generate_share_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character random code
    code := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM giveaways WHERE share_code = code) INTO exists;
    
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate share codes for giveaways
CREATE OR REPLACE FUNCTION auto_generate_share_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_code IS NULL THEN
    NEW.share_code := generate_share_code();
    NEW.share_url := 'https://onagui.com/g/' || NEW.share_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER giveaway_share_code_trigger
BEFORE INSERT ON giveaways
FOR EACH ROW
EXECUTE FUNCTION auto_generate_share_code();

-- Update existing giveaways with share codes
UPDATE giveaways 
SET share_code = generate_share_code(),
    share_url = 'https://onagui.com/g/' || share_code
WHERE share_code IS NULL;
