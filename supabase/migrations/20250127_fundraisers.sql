-- Fundraisers Table (GoFundMe-style)
CREATE TABLE IF NOT EXISTS onagui.fundraisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Financial
  goal_amount DECIMAL(18, 6) NOT NULL DEFAULT 0,
  raised_amount DECIMAL(18, 6) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USDC',
  
  -- Media
  cover_image TEXT,
  images TEXT[], -- Array of image URLs
  video_url TEXT,
  
  -- Location
  location TEXT,
  country TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Beneficiary (who receives funds)
  beneficiary_name TEXT,
  beneficiary_relationship TEXT,
  
  -- Crypto Wallet
  wallet_address TEXT NOT NULL,
  
  -- Metadata
  tags TEXT[],
  total_donations INT DEFAULT 0,
  total_donors INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ
);

-- Donations Table
CREATE TABLE IF NOT EXISTS onagui.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES onagui.fundraisers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Donation Details
  amount DECIMAL(18, 6) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  
  -- Donor Info (can be anonymous)
  donor_name TEXT,
  donor_email TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT,
  
  -- Crypto Transaction
  transaction_hash TEXT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  blockchain TEXT NOT NULL DEFAULT 'polygon',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Fundraiser Updates (like GoFundMe updates)
CREATE TABLE IF NOT EXISTS onagui.fundraiser_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES onagui.fundraisers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments on Fundraisers
CREATE TABLE IF NOT EXISTS onagui.fundraiser_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES onagui.fundraisers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  comment TEXT NOT NULL,
  donor_name TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fundraisers_user_id ON onagui.fundraisers(user_id);
CREATE INDEX idx_fundraisers_status ON onagui.fundraisers(status);
CREATE INDEX idx_fundraisers_category ON onagui.fundraisers(category);
CREATE INDEX idx_fundraisers_created_at ON onagui.fundraisers(created_at DESC);
CREATE INDEX idx_donations_fundraiser_id ON onagui.donations(fundraiser_id);
CREATE INDEX idx_donations_user_id ON onagui.donations(user_id);
CREATE INDEX idx_donations_status ON onagui.donations(status);
CREATE INDEX idx_fundraiser_updates_fundraiser_id ON onagui.fundraiser_updates(fundraiser_id);
CREATE INDEX idx_fundraiser_comments_fundraiser_id ON onagui.fundraiser_comments(fundraiser_id);

-- RLS Policies
ALTER TABLE onagui.fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE onagui.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onagui.fundraiser_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onagui.fundraiser_comments ENABLE ROW LEVEL SECURITY;

-- Fundraisers: Anyone can view active ones
CREATE POLICY "Anyone can view active fundraisers"
  ON onagui.fundraisers FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

-- Fundraisers: Users can create their own
CREATE POLICY "Users can create fundraisers"
  ON onagui.fundraisers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Fundraisers: Users can update their own
CREATE POLICY "Users can update own fundraisers"
  ON onagui.fundraisers FOR UPDATE
  USING (auth.uid() = user_id);

-- Donations: Anyone can view
CREATE POLICY "Anyone can view donations"
  ON onagui.donations FOR SELECT
  USING (true);

-- Donations: Anyone can create (for crypto payments)
CREATE POLICY "Anyone can create donations"
  ON onagui.donations FOR INSERT
  WITH CHECK (true);

-- Updates: Anyone can view
CREATE POLICY "Anyone can view updates"
  ON onagui.fundraiser_updates FOR SELECT
  USING (true);

-- Updates: Fundraiser owners can create
CREATE POLICY "Owners can create updates"
  ON onagui.fundraiser_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM onagui.fundraisers 
      WHERE id = fundraiser_id AND user_id = auth.uid()
    )
  );

-- Comments: Anyone can view
CREATE POLICY "Anyone can view comments"
  ON onagui.fundraiser_comments FOR SELECT
  USING (true);

-- Comments: Authenticated users can comment
CREATE POLICY "Authenticated users can comment"
  ON onagui.fundraiser_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR donor_name IS NOT NULL);

-- Function to update fundraiser raised amount
CREATE OR REPLACE FUNCTION update_fundraiser_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE onagui.fundraisers
    SET 
      raised_amount = raised_amount + NEW.amount,
      total_donations = total_donations + 1,
      updated_at = NOW()
    WHERE id = NEW.fundraiser_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_donation_confirmed
  AFTER INSERT OR UPDATE OF status ON onagui.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_fundraiser_raised_amount();

-- Function to count unique donors
CREATE OR REPLACE FUNCTION update_fundraiser_donor_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE onagui.fundraisers
    SET total_donors = (
      SELECT COUNT(DISTINCT COALESCE(user_id::text, wallet_address))
      FROM onagui.donations
      WHERE fundraiser_id = NEW.fundraiser_id AND status = 'confirmed'
    )
    WHERE id = NEW.fundraiser_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_donation_confirmed_update_donors
  AFTER INSERT OR UPDATE OF status ON onagui.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_fundraiser_donor_count();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fundraisers_updated_at
  BEFORE UPDATE ON onagui.fundraisers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
