-- Add verified status columns to profiles table
-- Migration: Add verification status for social media accounts
-- Date: 2026-02-01

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS twitter_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS instagram_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS facebook_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS linkedin_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tiktok_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS youtube_verified BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.twitter_verified IS 'Whether Twitter/X account is verified';
COMMENT ON COLUMN profiles.instagram_verified IS 'Whether Instagram account is verified';
COMMENT ON COLUMN profiles.facebook_verified IS 'Whether Facebook account is verified';
COMMENT ON COLUMN profiles.linkedin_verified IS 'Whether LinkedIn account is verified';
COMMENT ON COLUMN profiles.tiktok_verified IS 'Whether TikTok account is verified';
COMMENT ON COLUMN profiles.youtube_verified IS 'Whether YouTube channel is verified';
