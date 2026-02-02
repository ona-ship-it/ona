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
  submitted_for_review BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(verification_code)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_social_verifications_user_id ON social_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_social_verifications_code ON social_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_social_verifications_platform ON social_verifications(platform);
CREATE INDEX IF NOT EXISTS idx_social_verifications_submitted ON social_verifications(submitted_for_review);
CREATE INDEX IF NOT EXISTS idx_social_verifications_verified ON social_verifications(verified);

-- Enable RLS
ALTER TABLE social_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own verifications"
  ON social_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications"
  ON social_verifications FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'theoonagui@icloud.com',
      'samiraeddaoudi88@gmail.com'
    )
  );

CREATE POLICY "Users can insert their own verifications"
  ON social_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications"
  ON social_verifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all verifications"
  ON social_verifications FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      'theoonagui@icloud.com',
      'samiraeddaoudi88@gmail.com'
    )
  );

CREATE POLICY "Users can delete their own verifications"
  ON social_verifications FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE social_verifications IS 'Stores social media verification codes and status';

-- Create admin verification function
CREATE OR REPLACE FUNCTION admin_verify_social_account(
  target_user_id UUID,
  social_platform TEXT,
  verified_status BOOLEAN
)
RETURNS void AS $$
BEGIN
  -- Update profile verification status
  CASE social_platform
    WHEN 'twitter' THEN
      UPDATE profiles SET twitter_verified = verified_status WHERE id = target_user_id;
    WHEN 'instagram' THEN
      UPDATE profiles SET instagram_verified = verified_status WHERE id = target_user_id;
    WHEN 'tiktok' THEN
      UPDATE profiles SET tiktok_verified = verified_status WHERE id = target_user_id;
    WHEN 'youtube' THEN
      UPDATE profiles SET youtube_verified = verified_status WHERE id = target_user_id;
    WHEN 'facebook' THEN
      UPDATE profiles SET facebook_verified = verified_status WHERE id = target_user_id;
    WHEN 'linkedin' THEN
      UPDATE profiles SET linkedin_verified = verified_status WHERE id = target_user_id;
  END CASE;
  
  -- Update verification records
  UPDATE social_verifications 
  SET verified = verified_status, verified_at = NOW()
  WHERE user_id = target_user_id AND platform = social_platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admin check will be done in app)
GRANT EXECUTE ON FUNCTION admin_verify_social_account TO authenticated;
