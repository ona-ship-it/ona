-- ================================================================================
-- GIVEAWAY ESCROW SYSTEM IMPLEMENTATION
-- ================================================================================
-- This script implements an escrow system that requires users to have sufficient
-- wallet balance before creating giveaways, while allowing admin bypass.

-- --------------------------------------------------------------------------------
-- 1. WALLETS TABLE SETUP (MVP for Escrow Check)
-- --------------------------------------------------------------------------------
-- This table is required for the RLS check to verify the user's balance.

CREATE TABLE IF NOT EXISTS onagui.wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on wallets for security
ALTER TABLE onagui.wallets ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own wallet balance (needed for RLS check to work)
CREATE POLICY "Users can select their own wallet balance"
ON onagui.wallets FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin policy for wallets (allow admins to manage all wallets)
CREATE POLICY "Admins can manage all wallets"
ON onagui.wallets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onagui.user_roles ur
    JOIN onagui.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onagui.user_roles ur
    JOIN onagui.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);

-- --------------------------------------------------------------------------------
-- 2. GIVEAWAYS TABLE COLUMN CHECK (Ensure prize_amount exists)
-- --------------------------------------------------------------------------------
-- This checks if the column needed for escrow exists on the giveaways table.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'onagui'
          AND table_name = 'giveaways'
          AND column_name = 'prize_amount'
    ) THEN
        -- Add the column if it's missing (assuming the currency is USD for the MVP)
        ALTER TABLE onagui.giveaways ADD COLUMN prize_amount numeric NOT NULL DEFAULT 0.00;
        RAISE NOTICE 'Added prize_amount column to onagui.giveaways';
    ELSE
        RAISE NOTICE 'prize_amount column already exists on onagui.giveaways';
    END IF;
END
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------------------
-- 3. ADMIN HELPER FUNCTION (if not exists)
-- --------------------------------------------------------------------------------
-- Create the admin check function if it doesn't exist
CREATE OR REPLACE FUNCTION onagui.is_admin_user(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM onagui.user_roles ur
    JOIN onagui.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = 'admin'
  );
END;
$$;

-- --------------------------------------------------------------------------------
-- 4. RLS ESCROW POLICY (The Core Logic)
-- --------------------------------------------------------------------------------
-- This policy defines the "WITH CHECK" rule for INSERT operations on the giveaways table.
-- It requires EITHER (User is Admin) OR (User has sufficient funds in their wallet).

-- First, check if the old insert policy exists and drop it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'giveaways' 
        AND policyname = 'giveaways_insert_owner'
    ) THEN
        DROP POLICY giveaways_insert_owner ON onagui.giveaways;
        RAISE NOTICE 'Dropped existing giveaways_insert_owner policy';
    END IF;
END
$$ LANGUAGE plpgsql;

-- Create the new escrow policy
CREATE POLICY "Admin bypass or sufficient funds required for insert"
ON onagui.giveaways FOR INSERT
TO authenticated
WITH CHECK (
    -- RULE 1: ADMIN BYPASS
    -- Allow insert if the user is an admin (using the trusted DB function)
    (onagui.is_admin_user(auth.uid()))
    OR
    -- RULE 2: ESCROW CHECK (Non-Admin Users)
    -- Allow insert if the user's wallet balance is greater than or equal to the prize amount.
    (EXISTS (
        SELECT 1
        FROM onagui.wallets w
        WHERE w.user_id = auth.uid()
        AND w.balance >= NEW.prize_amount
    ))
);

-- --------------------------------------------------------------------------------
-- 5. WALLET MANAGEMENT FUNCTIONS
-- --------------------------------------------------------------------------------

-- Function to create a wallet for a user (if it doesn't exist)
CREATE OR REPLACE FUNCTION onagui.ensure_user_wallet(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO onagui.wallets (user_id, balance, currency)
  VALUES (user_uuid, 0.00, 'USD')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Function to add funds to a user's wallet (admin only)
CREATE OR REPLACE FUNCTION onagui.add_funds_to_wallet(
  user_uuid uuid,
  amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the caller is an admin
  IF NOT onagui.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can add funds to wallets';
  END IF;
  
  -- Ensure the user has a wallet
  PERFORM onagui.ensure_user_wallet(user_uuid);
  
  -- Add the funds
  UPDATE onagui.wallets
  SET balance = balance + amount
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User wallet not found';
  END IF;
END;
$$;

-- Function to deduct funds from a user's wallet (for escrow)
CREATE OR REPLACE FUNCTION onagui.deduct_funds_from_wallet(
  user_uuid uuid,
  amount numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance numeric;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM onagui.wallets
  WHERE user_id = user_uuid;
  
  -- Check if wallet exists and has sufficient funds
  IF current_balance IS NULL THEN
    RETURN false;
  END IF;
  
  IF current_balance < amount THEN
    RETURN false;
  END IF;
  
  -- Deduct the funds
  UPDATE onagui.wallets
  SET balance = balance - amount
  WHERE user_id = user_uuid;
  
  RETURN true;
END;
$$;

-- --------------------------------------------------------------------------------
-- 6. VERIFICATION QUERIES
-- --------------------------------------------------------------------------------

-- Query to verify the escrow policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'giveaways'
  AND policyname = 'Admin bypass or sufficient funds required for insert'
ORDER BY tablename, policyname;

-- Query to check if wallets table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'onagui' 
  AND table_name = 'wallets'
ORDER BY ordinal_position;

-- Query to check if prize_amount column was added
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'onagui' 
  AND table_name = 'giveaways'
  AND column_name = 'prize_amount';

-- --------------------------------------------------------------------------------
-- 7. USAGE NOTES
-- --------------------------------------------------------------------------------

/*
USAGE EXAMPLES:

1. Create a wallet for a user:
   SELECT onagui.ensure_user_wallet('user-uuid-here');

2. Add funds to a user's wallet (admin only):
   SELECT onagui.add_funds_to_wallet('user-uuid-here', 100.00);

3. Check a user's balance:
   SELECT balance FROM onagui.wallets WHERE user_id = auth.uid();

4. The escrow system will automatically:
   - Allow admins to create giveaways regardless of balance
   - Require non-admin users to have sufficient wallet balance
   - Block giveaway creation if insufficient funds

INTEGRATION NOTES:
- You'll need to integrate wallet funding in your application
- Consider adding a wallet management interface for admins
- You may want to add transaction logging for fund movements
- The deduct_funds_from_wallet function can be called when a giveaway is created
*/