-- =====================================================
-- ONAGUI ESCROW SYSTEM - COMPATIBLE WITH EXISTING SETUP
-- Works with existing onagui schema functions
-- =====================================================

-- =====================================================
-- 1. ENSURE GIVEAWAYS TABLE HAS ESCROW COLUMNS
-- =====================================================

-- Add escrow_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'giveaways' 
        AND column_name = 'escrow_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.giveaways ADD COLUMN escrow_status TEXT DEFAULT 'none';
    END IF;
END $$;

-- Add escrow_amount column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'giveaways' 
        AND column_name = 'escrow_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.giveaways ADD COLUMN escrow_amount NUMERIC(15,2) DEFAULT 0.00;
    END IF;
END $$;

-- =====================================================
-- 2. CREATE PUBLIC WRAPPER FUNCTIONS (for backward compatibility)
-- =====================================================

-- Wrapper for onagui.ensure_user_wallet
CREATE OR REPLACE FUNCTION public.ensure_user_wallet(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN onagui.ensure_user_wallet(user_uuid);
END;
$$;

-- Wrapper for onagui.is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN onagui.is_admin_user(user_uuid);
END;
$$;

-- Wrapper for onagui.add_funds_to_wallet_fiat
CREATE OR REPLACE FUNCTION public.add_funds_to_wallet_fiat(user_uuid UUID, amount_to_add NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN onagui.add_funds_to_wallet_fiat(user_uuid, amount_to_add);
END;
$$;

-- Wrapper for onagui.deduct_funds_from_wallet_fiat
CREATE OR REPLACE FUNCTION public.deduct_funds_from_wallet_fiat(user_uuid UUID, amount_to_deduct NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN onagui.deduct_funds_from_wallet_fiat(user_uuid, amount_to_deduct);
END;
$$;

-- Wrapper for onagui.add_funds_to_wallet_tickets
CREATE OR REPLACE FUNCTION public.add_funds_to_wallet_tickets(user_uuid UUID, amount_to_add INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN onagui.add_funds_to_wallet_tickets(user_uuid, amount_to_add);
END;
$$;

-- Wrapper for onagui.deduct_funds_from_wallet_tickets
CREATE OR REPLACE FUNCTION public.deduct_funds_from_wallet_tickets(user_uuid UUID, amount_to_deduct INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN onagui.deduct_funds_from_wallet_tickets(user_uuid, amount_to_deduct);
END;
$$;

-- Admin function wrapper (matches your backend expectations)
CREATE OR REPLACE FUNCTION public.add_funds_to_wallet(user_uuid UUID, amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if current user is admin using onagui function
    IF NOT onagui.is_admin_user(auth.uid()) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;
    
    -- Use the onagui function
    RETURN onagui.add_funds_to_wallet_fiat(user_uuid, amount);
END;
$$;

-- =====================================================
-- 3. CREATE ESCROW TRIGGER FOR GIVEAWAYS
-- =====================================================

-- Function to handle escrow on giveaway creation
CREATE OR REPLACE FUNCTION public.handle_giveaway_escrow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_wallet_id UUID;
    is_admin BOOLEAN;
    wallet_balance NUMERIC;
BEGIN
    -- Check if user is admin using onagui function
    is_admin := onagui.is_admin_user(NEW.creator_id);
    
    -- If admin, allow without escrow
    IF is_admin THEN
        NEW.escrow_status := 'admin_bypass';
        NEW.escrow_amount := 0;
        RETURN NEW;
    END IF;
    
    -- Ensure user has a wallet using onagui function
    user_wallet_id := onagui.ensure_user_wallet(NEW.creator_id);
    
    -- Get current wallet balance from onagui.wallets
    SELECT balance_fiat INTO wallet_balance
    FROM onagui.wallets
    WHERE user_id = NEW.creator_id;
    
    -- Check if user has sufficient funds
    IF COALESCE(wallet_balance, 0) < NEW.prize_amount THEN
        RAISE EXCEPTION 'Insufficient funds for escrow. Required: %, Available: %', 
            NEW.prize_amount, COALESCE(wallet_balance, 0);
    END IF;
    
    -- Deduct funds using onagui function
    IF NOT onagui.deduct_funds_from_wallet_fiat(NEW.creator_id, NEW.prize_amount) THEN
        RAISE EXCEPTION 'Failed to deduct escrow funds from wallet';
    END IF;
    
    -- Set escrow status and amount
    NEW.escrow_status := 'held';
    NEW.escrow_amount := NEW.prize_amount;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS giveaway_escrow_trigger ON public.giveaways;
CREATE TRIGGER giveaway_escrow_trigger
    BEFORE INSERT ON public.giveaways
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_giveaway_escrow();

-- =====================================================
-- 4. GRANT PERMISSIONS ON WRAPPER FUNCTIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.ensure_user_wallet(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_funds_to_wallet_fiat(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_funds_from_wallet_fiat(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_funds_to_wallet_tickets(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_funds_from_wallet_tickets(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_funds_to_wallet(UUID, NUMERIC) TO authenticated;

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_giveaways_escrow_status ON public.giveaways(escrow_status);
CREATE INDEX IF NOT EXISTS idx_giveaways_creator_escrow ON public.giveaways(creator_id, escrow_status);

-- =====================================================
-- 6. ESCROW RELEASE FUNCTION (for when giveaway ends)
-- =====================================================

CREATE OR REPLACE FUNCTION public.release_giveaway_escrow(giveaway_id UUID, winner_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    giveaway_record RECORD;
    success BOOLEAN := FALSE;
BEGIN
    -- Get giveaway details
    SELECT * INTO giveaway_record
    FROM public.giveaways
    WHERE id = giveaway_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Giveaway not found';
    END IF;
    
    -- Only process if escrow is held
    IF giveaway_record.escrow_status != 'held' THEN
        RAISE EXCEPTION 'No escrow to release for this giveaway';
    END IF;
    
    -- Add funds to winner's wallet using onagui function
    success := onagui.add_funds_to_wallet_fiat(winner_user_id, giveaway_record.escrow_amount);
    
    IF success THEN
        -- Update giveaway escrow status
        UPDATE public.giveaways
        SET escrow_status = 'released',
            updated_at = NOW()
        WHERE id = giveaway_id;
    END IF;
    
    RETURN success;
END;
$$;

GRANT EXECUTE ON FUNCTION public.release_giveaway_escrow(UUID, UUID) TO authenticated;

-- =====================================================
-- ESCROW SYSTEM INTEGRATION COMPLETE!
-- This script integrates with your existing onagui schema functions
-- =====================================================