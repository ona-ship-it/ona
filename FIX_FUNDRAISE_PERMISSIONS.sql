-- Fix RLS Policies for Fundraise Tables in Public Schema
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE public.fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraiser_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraiser_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view active fundraisers" ON public.fundraisers;
DROP POLICY IF EXISTS "Users can create fundraisers" ON public.fundraisers;
DROP POLICY IF EXISTS "Users can update own fundraisers" ON public.fundraisers;
DROP POLICY IF EXISTS "Anyone can view donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can create donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can view updates" ON public.fundraiser_updates;
DROP POLICY IF EXISTS "Owners can create updates" ON public.fundraiser_updates;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.fundraiser_comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.fundraiser_comments;

-- Fundraisers Policies
CREATE POLICY "Anyone can view active fundraisers"
  ON public.fundraisers FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create fundraisers"
  ON public.fundraisers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fundraisers"
  ON public.fundraisers FOR UPDATE
  USING (auth.uid() = user_id);

-- Donations Policies
CREATE POLICY "Anyone can view donations"
  ON public.donations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

-- Updates Policies
CREATE POLICY "Anyone can view updates"
  ON public.fundraiser_updates FOR SELECT
  USING (true);

CREATE POLICY "Owners can create updates"
  ON public.fundraiser_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.fundraisers 
      WHERE id = fundraiser_id AND user_id = auth.uid()
    )
  );

-- Comments Policies
CREATE POLICY "Anyone can view comments"
  ON public.fundraiser_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.fundraiser_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR donor_name IS NOT NULL);
