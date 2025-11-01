-- =========================================================
-- 🔧 MISSING SQL FUNCTIONS FOR TYPESCRIPT API FIXES
-- =========================================================
-- Execute this SQL in Supabase Dashboard > SQL Editor

-- 1️⃣ Create get_user_balance function
-- This function calculates user balance from the ledger table
CREATE OR REPLACE FUNCTION public.get_user_balance(p_user_id uuid, p_currency text DEFAULT 'USDT')
RETURNS numeric AS $$
DECLARE
  bal numeric;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO bal 
  FROM ledger 
  WHERE user_id = p_user_id 
    AND currency = p_currency 
    AND status = 'posted';
  
  RETURN bal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2️⃣ Create get_user_balance with single parameter (overload)
CREATE OR REPLACE FUNCTION public.get_user_balance(p_user_id uuid)
RETURNS numeric AS $$
BEGIN
  RETURN public.get_user_balance(p_user_id, 'USDT');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3️⃣ Create function to get all user balances by currency
CREATE OR REPLACE FUNCTION public.get_user_balances(p_user_id uuid)
RETURNS TABLE(currency text, balance numeric) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.currency,
    COALESCE(SUM(l.amount), 0) as balance
  FROM ledger l
  WHERE l.user_id = p_user_id 
    AND l.status = 'posted'
  GROUP BY l.currency;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4️⃣ Create function to check if user has sufficient balance
CREATE OR REPLACE FUNCTION public.check_user_balance(
  p_user_id uuid, 
  p_amount numeric, 
  p_currency text DEFAULT 'USDT'
)
RETURNS boolean AS $$
DECLARE
  current_balance numeric;
BEGIN
  SELECT public.get_user_balance(p_user_id, p_currency) INTO current_balance;
  RETURN current_balance >= p_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5️⃣ Create function to transfer funds between users
CREATE OR REPLACE FUNCTION public.transfer_funds(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount numeric,
  p_currency text DEFAULT 'USDT',
  p_reference text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  from_balance numeric;
  to_balance numeric;
  transfer_id uuid;
BEGIN
  -- Check if sender has sufficient balance
  SELECT public.get_user_balance(p_from_user_id, p_currency) INTO from_balance;
  
  IF from_balance < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'from_balance', from_balance,
      'required', p_amount
    );
  END IF;
  
  -- Generate transfer ID
  transfer_id := gen_random_uuid();
  
  -- Debit from sender
  INSERT INTO ledger (user_id, amount, currency, type, reference, status)
  VALUES (p_from_user_id, -p_amount, p_currency, 'debit', 
          COALESCE(p_reference, 'transfer_' || transfer_id), 'posted');
  
  -- Credit to receiver
  INSERT INTO ledger (user_id, amount, currency, type, reference, status)
  VALUES (p_to_user_id, p_amount, p_currency, 'credit', 
          COALESCE(p_reference, 'transfer_' || transfer_id), 'posted');
  
  -- Get updated balances
  SELECT public.get_user_balance(p_from_user_id, p_currency) INTO from_balance;
  SELECT public.get_user_balance(p_to_user_id, p_currency) INTO to_balance;
  
  RETURN json_build_object(
    'success', true,
    'transfer_id', transfer_id,
    'from_balance', from_balance,
    'to_balance', to_balance,
    'amount', p_amount,
    'currency', p_currency
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6️⃣ Create function to process deposits
CREATE OR REPLACE FUNCTION public.process_deposit(
  p_user_id uuid,
  p_amount numeric,
  p_currency text DEFAULT 'USDT',
  p_tx_hash text DEFAULT NULL,
  p_network text DEFAULT 'ethereum'
)
RETURNS json AS $$
DECLARE
  deposit_id uuid;
  new_balance numeric;
BEGIN
  -- Generate deposit ID
  deposit_id := gen_random_uuid();
  
  -- Create ledger entry for deposit
  INSERT INTO ledger (user_id, amount, currency, type, reference, status)
  VALUES (p_user_id, p_amount, p_currency, 'deposit', 
          COALESCE(p_tx_hash, 'deposit_' || deposit_id), 'posted');
  
  -- Record in deposit_transactions if table exists
  BEGIN
    INSERT INTO deposit_transactions (
      user_id, network, tx_hash, amount, currency, status, confirmations
    ) VALUES (
      p_user_id, p_network, p_tx_hash, p_amount, p_currency, 'confirmed', 12
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- Table doesn't exist yet, skip this step
      NULL;
  END;
  
  -- Get updated balance
  SELECT public.get_user_balance(p_user_id, p_currency) INTO new_balance;
  
  RETURN json_build_object(
    'success', true,
    'deposit_id', deposit_id,
    'new_balance', new_balance,
    'amount', p_amount,
    'currency', p_currency
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7️⃣ Create function to get transaction history
CREATE OR REPLACE FUNCTION public.get_user_transactions(
  p_user_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  amount numeric,
  currency text,
  type text,
  reference text,
  status text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.amount,
    l.currency,
    l.type,
    l.reference,
    l.status,
    l.created_at
  FROM ledger l
  WHERE l.user_id = p_user_id
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ SQL Functions created successfully!
-- Functions: get_user_balance, get_user_balances, check_user_balance, 
--           transfer_funds, process_deposit, get_user_transactions