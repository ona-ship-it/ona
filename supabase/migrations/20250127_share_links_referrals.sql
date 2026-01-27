-- Create share_links table for tracking referral shares
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  share_code TEXT NOT NULL UNIQUE,
  share_url TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT, -- twitter, facebook, whatsapp, telegram, direct
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  tickets_granted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table to track who signed up via whose link
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
  giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_granted BOOLEAN DEFAULT FALSE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(giveaway_id, referred_user_id) -- One free ticket per giveaway per user
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_share_links_giveaway ON share_links(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_share_links_creator ON share_links(creator_id);
CREATE INDEX IF NOT EXISTS idx_share_links_code ON share_links(share_code);
CREATE INDEX IF NOT EXISTS idx_referrals_share_link ON referrals(share_link_id);
CREATE INDEX IF NOT EXISTS idx_referrals_giveaway ON referrals(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);

-- Enable RLS
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policies for share_links
CREATE POLICY "Anyone can view share links"
  ON share_links FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own share links"
  ON share_links FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own share links"
  ON share_links FOR UPDATE
  USING (auth.uid() = creator_id);

-- Policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update referrals"
  ON referrals FOR UPDATE
  USING (true);
