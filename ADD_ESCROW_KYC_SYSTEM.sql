-- Add Escrow and KYC System to Fundraisers
-- Run this in Supabase SQL Editor

-- Add platform fee tracking to donations table
ALTER TABLE public.donations 
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(24, 8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC(24, 8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'held' CHECK (escrow_status IN ('held', 'released', 'refunded'));

-- Add escrow tracking to fundraisers table
ALTER TABLE public.fundraisers
  ADD COLUMN IF NOT EXISTS escrow_balance NUMERIC(24, 8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_fees NUMERIC(24, 8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS withdrawal_status TEXT DEFAULT 'pending' CHECK (withdrawal_status IN ('pending', 'kyc_required', 'processing', 'completed'));

-- Create KYC verification table
CREATE TABLE IF NOT EXISTS public.fundraiser_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID UNIQUE NOT NULL REFERENCES public.fundraisers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Info
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  
  -- Documents
  passport_photo_url TEXT NOT NULL,
  id_document_url TEXT,
  proof_of_address_url TEXT,
  
  -- Verification Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional verification data
  notes TEXT
);

-- Create withdrawal requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES public.fundraisers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Withdrawal Details
  amount NUMERIC(24, 8) NOT NULL,
  platform_fee NUMERIC(24, 8) NOT NULL,
  net_amount NUMERIC(24, 8) NOT NULL,
  recipient_wallet TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'kyc_pending', 'approved', 'processing', 'completed', 'rejected')),
  rejection_reason TEXT,
  
  -- Transaction
  transaction_hash TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform revenue tracking table
CREATE TABLE IF NOT EXISTS public.platform_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID REFERENCES public.fundraisers(id) ON DELETE SET NULL,
  donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
  
  -- Revenue Details
  fee_amount NUMERIC(24, 8) NOT NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('percentage', 'fixed', 'combined')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month INTEGER,
  year INTEGER
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fundraiser_kyc_user ON public.fundraiser_kyc(user_id);
CREATE INDEX IF NOT EXISTS idx_fundraiser_kyc_status ON public.fundraiser_kyc(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_fundraiser ON public.withdrawal_requests(fundraiser_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_month ON public.platform_revenue(year, month);

-- Enable RLS
ALTER TABLE public.fundraiser_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for KYC
CREATE POLICY "Users can view own KYC"
  ON public.fundraiser_kyc FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own KYC"
  ON public.fundraiser_kyc FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC"
  ON public.fundraiser_kyc FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Withdrawal Requests
CREATE POLICY "Users can view own withdrawals"
  ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawals"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Platform Revenue (admin only)
CREATE POLICY "Only admins can view revenue"
  ON public.platform_revenue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Function to calculate platform fee (2.9% + $0.30)
CREATE OR REPLACE FUNCTION calculate_platform_fee(donation_amount NUMERIC)
RETURNS TABLE(platform_fee NUMERIC, net_amount NUMERIC) AS $$
DECLARE
  percentage_fee NUMERIC := donation_amount * 0.029;
  fixed_fee NUMERIC := 0.30;
  total_fee NUMERIC;
  net NUMERIC;
BEGIN
  total_fee := percentage_fee + fixed_fee;
  net := donation_amount - total_fee;
  
  RETURN QUERY SELECT total_fee, net;
END;
$$ LANGUAGE plpgsql;

-- Function to update fundraiser escrow balance
CREATE OR REPLACE FUNCTION update_fundraiser_escrow()
RETURNS TRIGGER AS $$
DECLARE
  fee_data RECORD;
BEGIN
  IF NEW.status = 'confirmed' THEN
    -- Calculate fees
    SELECT * INTO fee_data FROM calculate_platform_fee(NEW.amount);
    
    -- Update donation record with fees
    NEW.platform_fee := fee_data.platform_fee;
    NEW.net_amount := fee_data.net_amount;
    
    -- Update fundraiser escrow balance
    UPDATE public.fundraisers
    SET 
      escrow_balance = escrow_balance + fee_data.net_amount,
      total_fees = total_fees + fee_data.platform_fee,
      raised_amount = raised_amount + NEW.amount,
      total_donations = total_donations + 1,
      updated_at = NOW()
    WHERE id = NEW.fundraiser_id;
    
    -- Track platform revenue
    INSERT INTO public.platform_revenue (fundraiser_id, donation_id, fee_amount, fee_type, month, year)
    VALUES (
      NEW.fundraiser_id,
      NEW.id,
      fee_data.platform_fee,
      'combined',
      EXTRACT(MONTH FROM NOW()),
      EXTRACT(YEAR FROM NOW())
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace the old donation trigger with new escrow trigger
DROP TRIGGER IF EXISTS on_donation_confirmed ON public.donations;
DROP TRIGGER IF EXISTS on_donation_confirmed_update_donors ON public.donations;

CREATE TRIGGER on_donation_confirmed_escrow
  BEFORE INSERT OR UPDATE OF status ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_fundraiser_escrow();

CREATE TRIGGER on_donation_confirmed_update_donors
  AFTER INSERT OR UPDATE OF status ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_fundraiser_donor_count();

-- Function to check if KYC is required
CREATE OR REPLACE FUNCTION check_kyc_required(p_fundraiser_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  fundraiser_status TEXT;
  has_kyc BOOLEAN;
BEGIN
  -- Get fundraiser status
  SELECT status INTO fundraiser_status
  FROM public.fundraisers
  WHERE id = p_fundraiser_id;
  
  -- Check if KYC already exists
  SELECT EXISTS (
    SELECT 1 FROM public.fundraiser_kyc 
    WHERE fundraiser_id = p_fundraiser_id
  ) INTO has_kyc;
  
  -- KYC required if fundraiser is completed or cancelled and no KYC exists
  IF (fundraiser_status IN ('completed', 'cancelled') OR fundraiser_status = 'active') AND NOT has_kyc THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON public.fundraiser_kyc TO postgres, authenticated;
GRANT ALL ON public.withdrawal_requests TO postgres, authenticated;
GRANT ALL ON public.platform_revenue TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION calculate_platform_fee(NUMERIC) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_kyc_required(UUID) TO anon, authenticated;

-- Update existing donations to calculate fees retroactively (optional)
-- Uncomment if you want to apply fees to existing donations
/*
UPDATE public.donations d
SET 
  platform_fee = (SELECT platform_fee FROM calculate_platform_fee(d.amount)),
  net_amount = (SELECT net_amount FROM calculate_platform_fee(d.amount))
WHERE d.platform_fee IS NULL OR d.platform_fee = 0;
*/

-- Verify tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('fundraiser_kyc', 'withdrawal_requests', 'platform_revenue')
  AND table_schema = 'public'
ORDER BY table_name;
