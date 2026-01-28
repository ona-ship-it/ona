-- Escrow System with KYC for Fundraisers
-- Run this in Supabase SQL Editor after RECREATE_FUNDRAISERS.sql

-- Add escrow and KYC fields to fundraisers table
ALTER TABLE public.fundraisers
  ADD COLUMN IF NOT EXISTS escrow_balance NUMERIC(24, 8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fees NUMERIC(24, 8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC(24, 8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS kyc_approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'locked' CHECK (payout_status IN ('locked', 'ready', 'processing', 'completed')),
  ADD COLUMN IF NOT EXISTS payout_requested_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS payout_completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS payout_transaction_hash TEXT;

-- Add fee tracking to donations table
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(24, 8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC(24, 8) DEFAULT 0;

-- Create KYC submissions table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES public.fundraisers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Info
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  date_of_birth DATE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  
  -- Documents
  passport_photo_url TEXT NOT NULL,
  id_document_url TEXT,
  proof_of_address_url TEXT,
  
  -- Bank/Wallet Info
  withdrawal_wallet_address TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Admin Notes
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(fundraiser_id)
);

-- Create payout requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES public.fundraisers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Amounts
  gross_amount NUMERIC(24, 8) NOT NULL,
  platform_fees NUMERIC(24, 8) NOT NULL,
  net_amount NUMERIC(24, 8) NOT NULL,
  
  -- Payout Details
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Transaction
  transaction_hash TEXT,
  blockchain TEXT DEFAULT 'polygon',
  
  -- Admin
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_fundraiser_id ON public.kyc_submissions(fundraiser_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON public.kyc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_fundraiser_id ON public.payout_requests(fundraiser_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);

-- Enable RLS
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for KYC submissions
CREATE POLICY "Users can view their own KYC submissions"
  ON public.kyc_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KYC submissions"
  ON public.kyc_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending KYC submissions"
  ON public.kyc_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies for payout requests
CREATE POLICY "Users can view their own payout requests"
  ON public.payout_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payout requests"
  ON public.payout_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate platform fee (2.9% + $0.30)
CREATE OR REPLACE FUNCTION calculate_platform_fee(donation_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND((donation_amount * 0.029) + 0.30, 6);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update fundraiser escrow balance when donation is confirmed
CREATE OR REPLACE FUNCTION update_fundraiser_escrow()
RETURNS TRIGGER AS $$
DECLARE
  fee NUMERIC(24, 8);
  net NUMERIC(24, 8);
BEGIN
  IF NEW.status = 'confirmed' THEN
    -- Calculate fee and net amount for this donation
    fee := calculate_platform_fee(NEW.amount);
    net := NEW.amount - fee;
    
    -- Update the donation record with fee info
    NEW.platform_fee := fee;
    NEW.net_amount := net;
    
    -- Update fundraiser escrow balance and totals
    UPDATE public.fundraisers
    SET 
      raised_amount = raised_amount + NEW.amount,
      escrow_balance = escrow_balance + net,
      platform_fees = platform_fees + fee,
      net_amount = net_amount + net,
      total_donations = total_donations + 1,
      updated_at = NOW()
    WHERE id = NEW.fundraiser_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace the old trigger with the new escrow one
DROP TRIGGER IF EXISTS on_donation_confirmed ON public.donations;
CREATE TRIGGER on_donation_confirmed
  BEFORE INSERT OR UPDATE OF status ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_fundraiser_escrow();

-- Function to approve KYC and unlock funds
CREATE OR REPLACE FUNCTION approve_kyc(submission_id UUID)
RETURNS void AS $$
DECLARE
  fundraiser_record RECORD;
BEGIN
  -- Get the fundraiser_id from the KYC submission
  SELECT fundraiser_id INTO fundraiser_record
  FROM public.kyc_submissions
  WHERE id = submission_id;
  
  -- Update KYC submission status
  UPDATE public.kyc_submissions
  SET 
    status = 'approved',
    reviewed_at = NOW()
  WHERE id = submission_id;
  
  -- Update fundraiser status
  UPDATE public.fundraisers
  SET 
    kyc_status = 'approved',
    kyc_approved_at = NOW(),
    payout_status = 'ready'
  WHERE id = fundraiser_record.fundraiser_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.kyc_submissions TO postgres, anon, authenticated;
GRANT ALL ON public.payout_requests TO postgres, anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_platform_fee(NUMERIC) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION approve_kyc(UUID) TO authenticated;

-- Verify new tables exist
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name IN ('kyc_submissions', 'payout_requests')
  AND table_schema = 'public'
ORDER BY table_name;
