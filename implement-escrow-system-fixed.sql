-- Escrow System Implementation for ONAGUI
-- Updated to match existing schema with separate ticket and fiat balances
-- Based on Supabase's recommendations

-- Remove dependent policy on public.giveaways first (as suggested by Supabase)
DROP POLICY IF EXISTS giveaways_insert_admin_bypass ON public.giveaways;

-- Drop existing policies that might reference functions we need to recreate
DROP POLICY IF EXISTS "giveaways_insert_admin_bypass" ON onagui.giveaways;
DROP POLICY IF EXISTS "giveaways_insert_escrow_check" ON onagui.giveaways;
DROP POLICY IF EXISTS "wallets_select_own" ON onagui.wallets;
DROP POLICY IF EXISTS "wallets_update_own" ON onagui.wallets;

-- Drop existing functions (CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS onagui.is_admin_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS onagui.ensure_user_wallet(uuid) CASCADE;
DROP FUNCTION IF EXISTS onagui.add_funds_to_wallet(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS onagui.deduct_funds_from_wallet(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS onagui.add_funds_to_wallet_fiat(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS onagui.deduct_funds_from_wallet_fiat(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS onagui.add_funds_to_wallet_tickets(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS onagui.deduct_funds_from_wallet_tickets(uuid, integer) CASCADE;

-- Create the is_admin_user function
CREATE OR REPLACE FUNCTION onagui.is_admin_user(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM onagui_profiles 
        WHERE user_id = user_uuid 
        AND is_admin = true
    );
END;
$$;

-- ensure_user_wallet: ensure a row exists for the user and return user_id
CREATE OR REPLACE FUNCTION onagui.ensure_user_wallet(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO onagui.wallets (user_id, balance_tickets, balance_fiat, created_at)
  VALUES (user_uuid, 0, 0, now())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN user_uuid;
END;
$$;

-- add_funds_to_wallet_fiat
CREATE OR REPLACE FUNCTION onagui.add_funds_to_wallet_fiat(user_uuid uuid, amount_to_add numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM onagui.ensure_user_wallet(user_uuid);

  UPDATE onagui.wallets
  SET balance_fiat = COALESCE(balance_fiat, 0) + amount_to_add,
      created_at = COALESCE(created_at, now())
  WHERE user_id = user_uuid;

  RETURN FOUND;
END;
$$;

-- deduct_funds_from_wallet_fiat
CREATE OR REPLACE FUNCTION onagui.deduct_funds_from_wallet_fiat(user_uuid uuid, amount_to_deduct numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cur_balance numeric;
BEGIN
  SELECT balance_fiat INTO cur_balance FROM onagui.wallets WHERE user_id = user_uuid;

  IF cur_balance IS NULL OR cur_balance < amount_to_deduct THEN
    RETURN false;
  END IF;

  UPDATE onagui.wallets
  SET balance_fiat = balance_fiat - amount_to_deduct
  WHERE user_id = user_uuid;

  RETURN FOUND;
END;
$$;

-- For tickets (integer)
CREATE OR REPLACE FUNCTION onagui.add_funds_to_wallet_tickets(user_uuid uuid, amount_to_add integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM onagui.ensure_user_wallet(user_uuid);

  UPDATE onagui.wallets
  SET balance_tickets = COALESCE(balance_tickets, 0) + amount_to_add
  WHERE user_id = user_uuid;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION onagui.deduct_funds_from_wallet_tickets(user_uuid uuid, amount_to_deduct integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cur_balance integer;
BEGIN
  SELECT balance_tickets INTO cur_balance FROM onagui.wallets WHERE user_id = user_uuid;

  IF cur_balance IS NULL OR cur_balance < amount_to_deduct THEN
    RETURN false;
  END IF;

  UPDATE onagui.wallets
  SET balance_tickets = balance_tickets - amount_to_deduct
  WHERE user_id = user_uuid;

  RETURN FOUND;
END;
$$;

-- Enable RLS on wallets table (if not already enabled)
ALTER TABLE onagui.wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wallets
CREATE POLICY "wallets_select_own" ON onagui.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wallets_update_own" ON onagui.wallets
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for giveaways (escrow system)
-- Check both fiat and ticket balances for escrow
CREATE POLICY "giveaways_insert_admin_bypass" ON onagui.giveaways
    FOR INSERT WITH CHECK (
        onagui.is_admin_user(auth.uid()) OR
        (
            SELECT COALESCE(balance_fiat, 0) 
            FROM onagui.wallets 
            WHERE user_id = auth.uid()
        ) >= COALESCE(escrow_amount, 0)
    );

CREATE POLICY "giveaways_insert_escrow_check" ON onagui.giveaways
    FOR INSERT WITH CHECK (
        -- Allow if user is admin
        onagui.is_admin_user(auth.uid()) OR
        -- Or if user has sufficient wallet balance (checking fiat balance)
        (
            SELECT COALESCE(balance_fiat, 0) 
            FROM onagui.wallets 
            WHERE user_id = auth.uid()
        ) >= COALESCE(escrow_amount, 0)
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA onagui TO authenticated;
GRANT EXECUTE ON FUNCTION onagui.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION onagui.ensure_user_wallet(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION onagui.add_funds_to_wallet_fiat(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION onagui.deduct_funds_from_wallet_fiat(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION onagui.add_funds_to_wallet_tickets(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION onagui.deduct_funds_from_wallet_tickets(uuid, integer) TO authenticated;
GRANT SELECT, INSERT, UPDATE ON onagui.wallets TO authenticated;