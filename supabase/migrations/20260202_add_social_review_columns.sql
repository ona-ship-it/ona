-- Add submitted_for_review and submitted_at columns to social_verifications table
-- Migration: Add admin review workflow columns
-- Date: 2026-02-02

-- Add new columns if they don't exist
ALTER TABLE social_verifications 
ADD COLUMN IF NOT EXISTS submitted_for_review BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_social_verifications_submitted ON social_verifications(submitted_for_review);
CREATE INDEX IF NOT EXISTS idx_social_verifications_verified ON social_verifications(verified);

-- Update existing unverified records to be submitted for review
UPDATE social_verifications 
SET submitted_for_review = true,
    submitted_at = created_at
WHERE verified = false AND submitted_for_review = false;
