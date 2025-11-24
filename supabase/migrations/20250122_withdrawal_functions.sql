-- Function to begin withdrawal transaction with atomic balance check
CREATE OR REPLACE FUNCTION public.begin_withdrawal_transaction(
    p_withdrawal_id UUID,
    p_user_id UUID,
    p_amount DECIMAL,
    p_currency TEXT DEFAULT 'USDT'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
    v_current_balance DECIMAL;
    v_available_balance DECIMAL;
BEGIN
    -- Start transaction
    BEGIN
        -- Get wallet for user and currency
        SELECT id, balance INTO v_wallet_id, v_current_balance
        FROM public.wallets
        WHERE user_id = p_user_id AND currency = p_currency
        FOR UPDATE; -- Lock the wallet row
        
        IF v_wallet_id IS NULL THEN
            RAISE EXCEPTION 'Wallet not found for user % and currency %', p_user_id, p_currency;
        END IF;
        
        -- Calculate available balance (current balance minus pending withdrawals)
        SELECT COALESCE(v_current_balance - SUM(amount), v_current_balance) INTO v_available_balance
        FROM public.withdrawals
        WHERE user_id = p_user_id 
          AND currency = p_currency 
          AND status IN ('pending', 'processing');
        
        -- Check if sufficient balance
        IF v_available_balance < p_amount THEN
            RAISE EXCEPTION 'Insufficient balance. Available: %, Requested: %', v_available_balance, p_amount;
        END IF;
        
        -- Create ledger entry for withdrawal (pending)
        INSERT INTO public.ledger (
            user_id,
            wallet_id,
            type,
            amount,
            currency,
            status,
            reference,
            metadata
        ) VALUES (
            p_user_id,
            v_wallet_id,
            'withdrawal',
            -p_amount, -- Negative amount for withdrawal
            p_currency,
            'pending',
            'withdrawal_' || p_withdrawal_id::text,
            jsonb_build_object('withdrawal_id', p_withdrawal_id)
        );
        
        RETURN TRUE;
        
    EXCEPTION WHEN OTHERS THEN
        -- Transaction will be rolled back automatically
        RAISE;
    END;
END;
$$;

-- Function to commit withdrawal transaction
CREATE OR REPLACE FUNCTION public.commit_withdrawal_transaction(
    p_withdrawal_id UUID,
    p_tx_hash TEXT,
    p_gas_used TEXT DEFAULT '0',
    p_gas_price TEXT DEFAULT '0'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_withdrawal_record RECORD;
    v_wallet_id UUID;
BEGIN
    -- Start transaction
    BEGIN
        -- Get withdrawal details
        SELECT * INTO v_withdrawal_record
        FROM public.withdrawals
        WHERE id = p_withdrawal_id
        FOR UPDATE;
        
        IF v_withdrawal_record IS NULL THEN
            RAISE EXCEPTION 'Withdrawal not found: %', p_withdrawal_id;
        END IF;
        
        -- Get wallet ID
        SELECT id INTO v_wallet_id
        FROM public.wallets
        WHERE user_id = v_withdrawal_record.user_id 
          AND currency = v_withdrawal_record.currency
        FOR UPDATE;
        
        -- Update ledger entry to completed
        UPDATE public.ledger
        SET status = 'completed',
            metadata = metadata || jsonb_build_object(
                'tx_hash', p_tx_hash,
                'gas_used', p_gas_used,
                'gas_price', p_gas_price,
                'completed_at', now()
            ),
            updated_at = now()
        WHERE reference = 'withdrawal_' || p_withdrawal_id::text;
        
        -- Update wallet balance
        UPDATE public.wallets
        SET balance = balance - v_withdrawal_record.amount::DECIMAL,
            updated_at = now()
        WHERE id = v_wallet_id;
        
        -- Update withdrawal status
        UPDATE public.withdrawals
        SET status = 'completed',
            tx_hash = p_tx_hash,
            updated_at = now()
        WHERE id = p_withdrawal_id;
        
        RETURN TRUE;
        
    EXCEPTION WHEN OTHERS THEN
        -- Transaction will be rolled back automatically
        RAISE;
    END;
END;
$$;

-- Function to rollback withdrawal transaction
CREATE OR REPLACE FUNCTION public.rollback_withdrawal_transaction(
    p_withdrawal_id UUID,
    p_failure_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Start transaction
    BEGIN
        -- Update ledger entry to failed
        UPDATE public.ledger
        SET status = 'failed',
            metadata = metadata || jsonb_build_object(
                'failure_reason', p_failure_reason,
                'failed_at', now()
            ),
            updated_at = now()
        WHERE reference = 'withdrawal_' || p_withdrawal_id::text;
        
        -- Update withdrawal status
        UPDATE public.withdrawals
        SET status = 'failed',
            failure_reason = p_failure_reason,
            updated_at = now()
        WHERE id = p_withdrawal_id;
        
        RETURN TRUE;
        
    EXCEPTION WHEN OTHERS THEN
        -- Transaction will be rolled back automatically
        RAISE;
    END;
END;
$$;

-- Function to get withdrawal statistics
CREATE OR REPLACE FUNCTION public.get_withdrawal_stats()
RETURNS TABLE (
    total_withdrawals BIGINT,
    pending_withdrawals BIGINT,
    processing_withdrawals BIGINT,
    completed_withdrawals BIGINT,
    failed_withdrawals BIGINT,
    total_amount DECIMAL,
    pending_amount DECIMAL,
    completed_amount DECIMAL,
    failed_amount DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_withdrawals,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_withdrawals,
        COUNT(*) FILTER (WHERE status = 'processing')::BIGINT as processing_withdrawals,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_withdrawals,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_withdrawals,
        COALESCE(SUM(amount::DECIMAL), 0) as total_amount,
        COALESCE(SUM(amount::DECIMAL) FILTER (WHERE status = 'pending'), 0) as pending_amount,
        COALESCE(SUM(amount::DECIMAL) FILTER (WHERE status = 'completed'), 0) as completed_amount,
        COALESCE(SUM(amount::DECIMAL) FILTER (WHERE status = 'failed'), 0) as failed_amount
    FROM public.withdrawals;
END;
$$;

-- Function to get user's available balance (considering pending withdrawals)
CREATE OR REPLACE FUNCTION public.get_available_balance(
    p_user_id UUID,
    p_currency TEXT DEFAULT 'USDT'
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_balance DECIMAL := 0;
    v_pending_withdrawals DECIMAL := 0;
    v_available_balance DECIMAL := 0;
BEGIN
    -- Get wallet balance
    SELECT COALESCE(balance, 0) INTO v_wallet_balance
    FROM public.wallets
    WHERE user_id = p_user_id AND currency = p_currency;
    
    -- Get pending withdrawal amount
    SELECT COALESCE(SUM(amount::DECIMAL), 0) INTO v_pending_withdrawals
    FROM public.withdrawals
    WHERE user_id = p_user_id 
      AND currency = p_currency 
      AND status IN ('pending', 'processing');
    
    v_available_balance := v_wallet_balance - v_pending_withdrawals;
    
    RETURN GREATEST(v_available_balance, 0); -- Ensure non-negative
END;
$$;

-- Function to validate withdrawal request
CREATE OR REPLACE FUNCTION public.validate_withdrawal_request(
    p_user_id UUID,
    p_amount DECIMAL,
    p_currency TEXT DEFAULT 'USDT',
    p_to_address TEXT DEFAULT NULL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    error_message TEXT,
    available_balance DECIMAL,
    daily_limit DECIMAL,
    daily_used DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_available_balance DECIMAL;
    v_daily_limit DECIMAL := 10000; -- Default daily limit
    v_daily_used DECIMAL := 0;
    v_min_withdrawal DECIMAL := 10; -- Minimum withdrawal amount
    v_max_withdrawal DECIMAL := 50000; -- Maximum single withdrawal
BEGIN
    -- Get available balance
    v_available_balance := public.get_available_balance(p_user_id, p_currency);
    
    -- Get user's daily limit (if user_limits table exists)
    BEGIN
        SELECT COALESCE(daily_withdrawal_limit, v_daily_limit) INTO v_daily_limit
        FROM public.user_limits
        WHERE user_id = p_user_id AND currency = p_currency;
    EXCEPTION WHEN OTHERS THEN
        -- user_limits table might not exist or no record found
        v_daily_limit := 10000;
    END;
    
    -- Calculate daily used amount (last 24 hours)
    SELECT COALESCE(SUM(amount::DECIMAL), 0) INTO v_daily_used
    FROM public.withdrawals
    WHERE user_id = p_user_id 
      AND currency = p_currency 
      AND status = 'completed'
      AND created_at >= (now() - interval '24 hours');
    
    -- Validation checks
    IF p_amount <= 0 THEN
        RETURN QUERY SELECT FALSE, 'Invalid withdrawal amount', v_available_balance, v_daily_limit, v_daily_used;
        RETURN;
    END IF;
    
    IF p_amount < v_min_withdrawal THEN
        RETURN QUERY SELECT FALSE, format('Minimum withdrawal amount is %s %s', v_min_withdrawal, p_currency), v_available_balance, v_daily_limit, v_daily_used;
        RETURN;
    END IF;
    
    IF p_amount > v_max_withdrawal THEN
        RETURN QUERY SELECT FALSE, format('Maximum withdrawal amount is %s %s', v_max_withdrawal, p_currency), v_available_balance, v_daily_limit, v_daily_used;
        RETURN;
    END IF;
    
    IF p_amount > v_available_balance THEN
        RETURN QUERY SELECT FALSE, 'Insufficient balance', v_available_balance, v_daily_limit, v_daily_used;
        RETURN;
    END IF;
    
    IF (v_daily_used + p_amount) > v_daily_limit THEN
        RETURN QUERY SELECT FALSE, 'Daily withdrawal limit exceeded', v_available_balance, v_daily_limit, v_daily_used;
        RETURN;
    END IF;
    
    -- Address validation (basic check)
    IF p_to_address IS NOT NULL AND length(p_to_address) < 10 THEN
        RETURN QUERY SELECT FALSE, 'Invalid withdrawal address', v_available_balance, v_daily_limit, v_daily_used;
        RETURN;
    END IF;
    
    -- All validations passed
    RETURN QUERY SELECT TRUE, 'Validation successful', v_available_balance, v_daily_limit, v_daily_used;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.begin_withdrawal_transaction TO postgres;
GRANT EXECUTE ON FUNCTION public.commit_withdrawal_transaction TO postgres;
GRANT EXECUTE ON FUNCTION public.rollback_withdrawal_transaction TO postgres;
GRANT EXECUTE ON FUNCTION public.get_withdrawal_stats TO postgres;
GRANT EXECUTE ON FUNCTION public.get_available_balance TO postgres;
GRANT EXECUTE ON FUNCTION public.validate_withdrawal_request TO postgres;

-- Add comments
COMMENT ON FUNCTION public.begin_withdrawal_transaction IS 'Begins a withdrawal transaction with atomic balance checks';
COMMENT ON FUNCTION public.commit_withdrawal_transaction IS 'Commits a successful withdrawal transaction';
COMMENT ON FUNCTION public.rollback_withdrawal_transaction IS 'Rolls back a failed withdrawal transaction';
COMMENT ON FUNCTION public.get_withdrawal_stats IS 'Returns withdrawal statistics for monitoring';
COMMENT ON FUNCTION public.get_available_balance IS 'Returns user available balance considering pending withdrawals';
COMMENT ON FUNCTION public.validate_withdrawal_request IS 'Validates a withdrawal request against limits and balance';