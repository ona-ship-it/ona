-- Reconciliation and monitoring tables
-- This migration adds tables for tracking balance reconciliation and system monitoring

-- Reconciliation log table
CREATE TABLE IF NOT EXISTS reconciliation_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    user_id UUID NOT NULL,
    ledger_balance DECIMAL(20,6) NOT NULL,
    onchain_balance DECIMAL(20,6) NOT NULL,
    discrepancy DECIMAL(20,6) NOT NULL,
    discrepancy_percentage DECIMAL(10,4) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ok', 'warning', 'critical')),
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitoring alerts table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('balance_discrepancy', 'pending_withdrawals', 'failed_withdrawals', 'hot_wallet_low', 'system_error')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    data JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health metrics table
CREATE TABLE IF NOT EXISTS system_health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(20,6),
    metric_text TEXT,
    metric_json JSONB,
    status TEXT CHECK (status IN ('healthy', 'warning', 'critical')),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hot wallet transactions log
CREATE TABLE IF NOT EXISTS hot_wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_hash TEXT UNIQUE,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount DECIMAL(20,6) NOT NULL,
    gas_used BIGINT,
    gas_price DECIMAL(20,6),
    transaction_fee DECIMAL(20,6),
    block_number BIGINT,
    block_timestamp TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')),
    withdrawal_id UUID REFERENCES withdrawals(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reconciliation_log_user_id ON reconciliation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_log_wallet_address ON reconciliation_log(wallet_address);
CREATE INDEX IF NOT EXISTS idx_reconciliation_log_checked_at ON reconciliation_log(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliation_log_status ON reconciliation_log(status);

CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_type ON monitoring_alerts(type);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON monitoring_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_created_at ON monitoring_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_acknowledged ON monitoring_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_resolved ON monitoring_alerts(resolved);

CREATE INDEX IF NOT EXISTS idx_system_health_metrics_name ON system_health_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_recorded_at ON system_health_metrics(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_hot_wallet_transactions_hash ON hot_wallet_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_hot_wallet_transactions_withdrawal_id ON hot_wallet_transactions(withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_hot_wallet_transactions_created_at ON hot_wallet_transactions(created_at DESC);

-- RLS policies
ALTER TABLE reconciliation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hot_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Reconciliation log policies
CREATE POLICY "System can manage reconciliation logs" ON reconciliation_log
    FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view their reconciliation logs" ON reconciliation_log
    FOR SELECT USING (auth.uid() = user_id);

-- Monitoring alerts policies
CREATE POLICY "System can manage monitoring alerts" ON monitoring_alerts
    FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view all alerts" ON monitoring_alerts
    FOR SELECT USING (true); -- In production, add proper admin role check

-- System health metrics policies
CREATE POLICY "System can manage health metrics" ON system_health_metrics
    FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view health metrics" ON system_health_metrics
    FOR SELECT USING (true); -- In production, add proper admin role check

-- Hot wallet transactions policies
CREATE POLICY "System can manage hot wallet transactions" ON hot_wallet_transactions
    FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view hot wallet transactions" ON hot_wallet_transactions
    FOR SELECT USING (true); -- In production, add proper admin role check

-- Function to get total system balance
CREATE OR REPLACE FUNCTION get_total_system_balance()
RETURNS DECIMAL(20,6)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_balance DECIMAL(20,6);
BEGIN
    SELECT COALESCE(SUM(balance), 0)
    INTO total_balance
    FROM user_balances;
    
    RETURN total_balance;
END;
$$;

-- Function to get reconciliation summary
CREATE OR REPLACE FUNCTION get_reconciliation_summary(
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_wallets BIGINT,
    ok_wallets BIGINT,
    warning_wallets BIGINT,
    critical_wallets BIGINT,
    total_discrepancy DECIMAL(20,6),
    avg_discrepancy_percentage DECIMAL(10,4),
    last_check TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH latest_reconciliation AS (
        SELECT DISTINCT ON (wallet_address)
            wallet_address,
            status,
            discrepancy,
            discrepancy_percentage,
            checked_at
        FROM reconciliation_log
        WHERE checked_at >= NOW() - (p_hours || ' hours')::INTERVAL
        ORDER BY wallet_address, checked_at DESC
    )
    SELECT 
        COUNT(*) as total_wallets,
        COUNT(*) FILTER (WHERE status = 'ok') as ok_wallets,
        COUNT(*) FILTER (WHERE status = 'warning') as warning_wallets,
        COUNT(*) FILTER (WHERE status = 'critical') as critical_wallets,
        COALESCE(SUM(ABS(discrepancy)), 0) as total_discrepancy,
        COALESCE(AVG(ABS(discrepancy_percentage)), 0) as avg_discrepancy_percentage,
        MAX(checked_at) as last_check
    FROM latest_reconciliation;
END;
$$;

-- Function to get alert summary
CREATE OR REPLACE FUNCTION get_alert_summary(
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_alerts BIGINT,
    critical_alerts BIGINT,
    high_alerts BIGINT,
    medium_alerts BIGINT,
    low_alerts BIGINT,
    unacknowledged_alerts BIGINT,
    unresolved_alerts BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_alerts,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_alerts,
        COUNT(*) FILTER (WHERE severity = 'high') as high_alerts,
        COUNT(*) FILTER (WHERE severity = 'medium') as medium_alerts,
        COUNT(*) FILTER (WHERE severity = 'low') as low_alerts,
        COUNT(*) FILTER (WHERE NOT acknowledged) as unacknowledged_alerts,
        COUNT(*) FILTER (WHERE NOT resolved) as unresolved_alerts
    FROM monitoring_alerts
    WHERE created_at >= NOW() - (p_hours || ' hours')::INTERVAL;
END;
$$;

-- Function to acknowledge alert
CREATE OR REPLACE FUNCTION acknowledge_alert(
    p_alert_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE monitoring_alerts
    SET 
        acknowledged = TRUE,
        acknowledged_by = p_user_id,
        acknowledged_at = NOW()
    WHERE id = p_alert_id AND NOT acknowledged;
    
    RETURN FOUND;
END;
$$;

-- Function to resolve alert
CREATE OR REPLACE FUNCTION resolve_alert(
    p_alert_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE monitoring_alerts
    SET 
        resolved = TRUE,
        resolved_by = p_user_id,
        resolved_at = NOW(),
        acknowledged = TRUE,
        acknowledged_by = COALESCE(acknowledged_by, p_user_id),
        acknowledged_at = COALESCE(acknowledged_at, NOW())
    WHERE id = p_alert_id AND NOT resolved;
    
    RETURN FOUND;
END;
$$;

-- Function to record system health metric
CREATE OR REPLACE FUNCTION record_health_metric(
    p_metric_name TEXT,
    p_metric_value DECIMAL(20,6) DEFAULT NULL,
    p_metric_text TEXT DEFAULT NULL,
    p_metric_json JSONB DEFAULT NULL,
    p_status TEXT DEFAULT 'healthy'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    metric_id UUID;
BEGIN
    INSERT INTO system_health_metrics (
        metric_name,
        metric_value,
        metric_text,
        metric_json,
        status
    )
    VALUES (
        p_metric_name,
        p_metric_value,
        p_metric_text,
        p_metric_json,
        p_status
    )
    RETURNING id INTO metric_id;
    
    RETURN metric_id;
END;
$$;

-- Function to get latest health metrics
CREATE OR REPLACE FUNCTION get_latest_health_metrics()
RETURNS TABLE (
    metric_name TEXT,
    metric_value DECIMAL(20,6),
    metric_text TEXT,
    metric_json JSONB,
    status TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (shm.metric_name)
        shm.metric_name,
        shm.metric_value,
        shm.metric_text,
        shm.metric_json,
        shm.status,
        shm.recorded_at
    FROM system_health_metrics shm
    ORDER BY shm.metric_name, shm.recorded_at DESC;
END;
$$;

-- Function to cleanup old reconciliation logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_reconciliation_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM reconciliation_log 
    WHERE checked_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Function to cleanup old monitoring alerts (older than 180 days)
CREATE OR REPLACE FUNCTION cleanup_monitoring_alerts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM monitoring_alerts 
    WHERE created_at < NOW() - INTERVAL '180 days'
    AND resolved = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Function to cleanup old health metrics (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_health_metrics()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Keep only the latest 1000 records per metric and delete older than 30 days
    WITH metrics_to_keep AS (
        SELECT id
        FROM (
            SELECT id,
                   ROW_NUMBER() OVER (PARTITION BY metric_name ORDER BY recorded_at DESC) as rn
            FROM system_health_metrics
            WHERE recorded_at >= NOW() - INTERVAL '30 days'
        ) ranked
        WHERE rn <= 1000
    )
    DELETE FROM system_health_metrics 
    WHERE id NOT IN (SELECT id FROM metrics_to_keep)
    AND recorded_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Create views for monitoring dashboard
CREATE OR REPLACE VIEW reconciliation_dashboard AS
SELECT 
    r.wallet_address,
    r.user_id,
    r.ledger_balance,
    r.onchain_balance,
    r.discrepancy,
    r.discrepancy_percentage,
    r.status,
    r.checked_at,
    cw.network,
    cw.created_at as wallet_created_at
FROM reconciliation_log r
JOIN crypto_wallets cw ON cw.address = r.wallet_address
WHERE r.checked_at >= NOW() - INTERVAL '24 hours'
ORDER BY r.checked_at DESC;

CREATE OR REPLACE VIEW alerts_dashboard AS
SELECT 
    ma.id,
    ma.type,
    ma.severity,
    ma.message,
    ma.data,
    ma.acknowledged,
    ma.acknowledged_by,
    ma.acknowledged_at,
    ma.resolved,
    ma.resolved_by,
    ma.resolved_at,
    ma.created_at,
    EXTRACT(EPOCH FROM (NOW() - ma.created_at)) / 3600 as hours_since_created
FROM monitoring_alerts ma
WHERE ma.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ma.created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON reconciliation_dashboard TO authenticated;
GRANT SELECT ON alerts_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_system_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_reconciliation_summary(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_alert_summary(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION acknowledge_alert(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_alert(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_health_metric(TEXT, DECIMAL, TEXT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_health_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_reconciliation_logs() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_monitoring_alerts() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_health_metrics() TO service_role;

-- Add comments for documentation
COMMENT ON TABLE reconciliation_log IS 'Logs balance reconciliation results between ledger and on-chain balances';
COMMENT ON TABLE monitoring_alerts IS 'Stores system monitoring alerts and their resolution status';
COMMENT ON TABLE system_health_metrics IS 'Records various system health and performance metrics';
COMMENT ON TABLE hot_wallet_transactions IS 'Logs all hot wallet transactions for audit and monitoring';
COMMENT ON FUNCTION get_total_system_balance() IS 'Returns the total balance across all user accounts';
COMMENT ON FUNCTION get_reconciliation_summary(INTEGER) IS 'Returns reconciliation summary for the specified time period';
COMMENT ON FUNCTION get_alert_summary(INTEGER) IS 'Returns alert summary for the specified time period';
COMMENT ON VIEW reconciliation_dashboard IS 'Dashboard view for reconciliation monitoring';
COMMENT ON VIEW alerts_dashboard IS 'Dashboard view for system alerts monitoring';