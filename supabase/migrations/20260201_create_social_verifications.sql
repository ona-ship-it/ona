-- Create social_verifications table for tracking verification codes
-- Migration: Social media account verification system
-- Date: 2026-02-01

CREATE TABLE IF NOT EXISTS social_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  profile_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(verification_code)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_social_verifications_user_id ON social_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_social_verifications_code ON social_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_social_verifications_platform ON social_verifications(platform);

-- Enable RLS
ALTER TABLE social_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own verifications"
  ON social_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verifications"
  ON social_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications"
  ON social_verifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verifications"
  ON social_verifications FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE social_verifications IS 'Stores social media verification codes and status';
