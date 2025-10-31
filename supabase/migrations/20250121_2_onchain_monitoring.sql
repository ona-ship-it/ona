-- Add monitor_state table to track last processed blocks
CREATE TABLE IF NOT EXISTS public.monitor_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network TEXT NOT NULL UNIQUE, -- 'mainnet', 'sepolia', etc.
    last_processed_block BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add deposits table (enhanced version)
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    currency TEXT NOT NULL DEFAULT 'USDT',
    network TEXT NOT NULL DEFAULT 'mainnet',
    amount DECIMAL(20,6) NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number BIGINT NOT NULL,
    confirmations INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tx_hash, to_address)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_monitor_state_network ON public.monitor_state(network);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_tx_hash ON public.deposits(tx_hash);
CREATE INDEX IF NOT EXISTS idx_deposits_network_status ON public.deposits(network, status);
CREATE INDEX IF NOT EXISTS idx_deposits_block_number ON public.deposits(block_number);

-- Add RLS policies
ALTER TABLE public.monitor_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Monitor state policies (system only for now)
CREATE POLICY "System can manage monitor state" ON public.monitor_state
    FOR ALL USING (true);

-- Deposits policies
CREATE POLICY "Users can view own deposits" ON public.deposits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can view all deposits" ON public.deposits
    FOR SELECT USING (true);

CREATE POLICY "System can insert deposits" ON public.deposits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update deposits" ON public.deposits
    FOR UPDATE USING (true);

-- Function to process confirmed deposits
CREATE OR REPLACE FUNCTION public.process_confirmed_deposit(
    p_deposit_id UUID,
    p_user_id UUID,
    p_amount DECIMAL,
    p_currency TEXT DEFAULT 'USDT'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
BEGIN
    -- Start transaction
    BEGIN
        -- Get or create wallet for user
        SELECT id INTO v_wallet_id
        FROM public.wallets
        WHERE user_id = p_user_id AND currency = p_currency;
        
        IF v_wallet_id IS NULL THEN
            INSERT INTO public.wallets (user_id, currency, balance)
            VALUES (p_user_id, p_currency, 0)
            RETURNING id INTO v_wallet_id;
        END IF;
        
        -- Create ledger entry for deposit
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
            'deposit',
            p_amount,
            p_currency,
            'completed',
            'deposit_' || p_deposit_id::text,
            jsonb_build_object('deposit_id', p_deposit_id)
        );
        
        -- Update wallet balance
        UPDATE public.wallets
        SET balance = balance + p_amount,
            updated_at = now()
        WHERE id = v_wallet_id;
        
        -- Update deposit status
        UPDATE public.deposits
        SET status = 'completed',
            updated_at = now()
        WHERE id = p_deposit_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Rollback will happen automatically
        RAISE;
    END;
END;
$$;

-- Function to get deposit statistics
CREATE OR REPLACE FUNCTION public.get_deposit_stats(
    p_network TEXT DEFAULT 'mainnet',
    p_currency TEXT DEFAULT 'USDT'
)
RETURNS TABLE (
    total_deposits BIGINT,
    pending_deposits BIGINT,
    completed_deposits BIGINT,
    failed_deposits BIGINT,
    total_amount DECIMAL,
    pending_amount DECIMAL,
    completed_amount DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_deposits,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_deposits,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_deposits,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_deposits,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_amount,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as completed_amount
    FROM public.deposits
    WHERE network = p_network AND currency = p_currency;
END;
$$;

-- Add updated_at trigger for deposits
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deposits_updated_at 
    BEFORE UPDATE ON public.deposits 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monitor_state_updated_at 
    BEFORE UPDATE ON public.monitor_state 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.monitor_state TO postgres;
GRANT SELECT, INSERT, UPDATE ON public.deposits TO postgres;
GRANT EXECUTE ON FUNCTION public.process_confirmed_deposit TO postgres;
GRANT EXECUTE ON FUNCTION public.get_deposit_stats TO postgres;

-- Add comments
COMMENT ON TABLE public.monitor_state IS 'Tracks the last processed block for each network';
COMMENT ON TABLE public.deposits IS 'Records all cryptocurrency deposits from on-chain transactions';
COMMENT ON FUNCTION public.process_confirmed_deposit IS 'Processes a confirmed deposit by updating balances and ledger';
COMMENT ON FUNCTION public.get_deposit_stats IS 'Returns deposit statistics for monitoring and reporting';