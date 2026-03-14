-- Add admin RLS policies for social_verifications table
-- Migration: Allow admins to view and update all social verifications
-- Date: 2026-02-02

-- Add admin SELECT policy
CREATE POLICY IF NOT EXISTS "Admins can view all verifications"
  ON social_verifications FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'theoonagui@icloud.com',
      'samiraeddaoudi88@gmail.com'
    )
  );

-- Add admin UPDATE policy
CREATE POLICY IF NOT EXISTS "Admins can update all verifications"
  ON social_verifications FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      'theoonagui@icloud.com',
      'samiraeddaoudi88@gmail.com'
    )
  );
