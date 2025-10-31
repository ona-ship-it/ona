-- Rate limiting and idempotency tables
-- This migration adds tables for tracking API rate limits and idempotency keys

-- Rate limit log table
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('transfer', 'withdraw', 'deposit', 'balance')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idempotency log table
CREATE TABLE IF NOT EXISTS idempotency_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    idempotency_key TEXT NOT NULL,
    response_data JSONB NOT NULL,
    status_code INTEGER DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, idempotency_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_user_operation_time 
ON rate_limit_log(user_id, operation, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_log_created_at 
ON rate_limit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_idempotency_log_user_key 
ON idempotency_log(user_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_idempotency_log_created_at 
ON idempotency_log(created_at);

-- RLS policies
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_log ENABLE ROW LEVEL SECURITY;

-- Rate limit log policies
CREATE POLICY "Users can view their own rate limit logs" ON rate_limit_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert rate limit logs" ON rate_limit_log
    FOR INSERT WITH CHECK (true);

-- Idempotency log policies  
CREATE POLICY "Users can view their own idempotency logs" ON idempotency_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage idempotency logs" ON idempotency_log
    FOR ALL WITH CHECK (true);

-- Function to clean up old rate limit logs (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limit_log 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Function to clean up old idempotency logs (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_idempotency_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM idempotency_log 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Function to get rate limit statistics
CREATE OR REPLACE FUNCTION get_rate_limit_stats(
    p_user_id UUID DEFAULT NULL,
    p_operation TEXT DEFAULT NULL,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    operation TEXT,
    request_count BIGINT,
    unique_users BIGINT,
    avg_requests_per_user NUMERIC,
    peak_hour TIMESTAMP WITH TIME ZONE,
    peak_hour_requests BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH hourly_stats AS (
        SELECT 
            rl.operation,
            date_trunc('hour', rl.created_at) as hour,
            COUNT(*) as requests,
            COUNT(DISTINCT rl.user_id) as users
        FROM rate_limit_log rl
        WHERE 
            rl.created_at >= NOW() - (p_hours || ' hours')::INTERVAL
            AND (p_user_id IS NULL OR rl.user_id = p_user_id)
            AND (p_operation IS NULL OR rl.operation = p_operation)
        GROUP BY rl.operation, date_trunc('hour', rl.created_at)
    ),
    peak_hours AS (
        SELECT 
            hs.operation,
            hs.hour,
            hs.requests,
            ROW_NUMBER() OVER (PARTITION BY hs.operation ORDER BY hs.requests DESC) as rn
        FROM hourly_stats hs
    )
    SELECT 
        rl.operation,
        COUNT(*) as request_count,
        COUNT(DISTINCT rl.user_id) as unique_users,
        ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT rl.user_id), 0), 2) as avg_requests_per_user,
        ph.hour as peak_hour,
        ph.requests as peak_hour_requests
    FROM rate_limit_log rl
    LEFT JOIN peak_hours ph ON ph.operation = rl.operation AND ph.rn = 1
    WHERE 
        rl.created_at >= NOW() - (p_hours || ' hours')::INTERVAL
        AND (p_user_id IS NULL OR rl.user_id = p_user_id)
        AND (p_operation IS NULL OR rl.operation = p_operation)
    GROUP BY rl.operation, ph.hour, ph.requests
    ORDER BY request_count DESC;
END;
$$;

-- Function to check if user is rate limited
CREATE OR REPLACE FUNCTION is_rate_limited(
    p_user_id UUID,
    p_operation TEXT,
    p_limit INTEGER,
    p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO request_count
    FROM rate_limit_log
    WHERE 
        user_id = p_user_id
        AND operation = p_operation
        AND created_at >= NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    RETURN request_count >= p_limit;
END;
$$;

-- Function to get user's current rate limit status
CREATE OR REPLACE FUNCTION get_user_rate_limit_status(p_user_id UUID)
RETURNS TABLE (
    operation TEXT,
    current_count BIGINT,
    limit_per_hour INTEGER,
    remaining INTEGER,
    reset_time TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rate_limits RECORD;
BEGIN
    -- Define rate limits (should match application config)
    FOR rate_limits IN 
        VALUES 
            ('transfer', 10, 60),    -- 10 per hour
            ('withdraw', 2, 1440),   -- 2 per day (1440 minutes)
            ('deposit', 50, 60),     -- 50 per hour
            ('balance', 100, 60)     -- 100 per hour
    LOOP
        RETURN QUERY
        WITH current_window AS (
            SELECT COUNT(*) as count
            FROM rate_limit_log rl
            WHERE 
                rl.user_id = p_user_id
                AND rl.operation = rate_limits.column1
                AND rl.created_at >= NOW() - (rate_limits.column3 || ' minutes')::INTERVAL
        )
        SELECT 
            rate_limits.column1::TEXT as operation,
            cw.count as current_count,
            rate_limits.column2 as limit_per_hour,
            GREATEST(0, rate_limits.column2 - cw.count::INTEGER) as remaining,
            (NOW() + (rate_limits.column3 || ' minutes')::INTERVAL) as reset_time
        FROM current_window cw;
    END LOOP;
END;
$$;

-- Function to log API request for rate limiting
CREATE OR REPLACE FUNCTION log_api_request(
    p_user_id UUID,
    p_operation TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO rate_limit_log (user_id, operation, ip_address, user_agent)
    VALUES (p_user_id, p_operation, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Function to store idempotency response
CREATE OR REPLACE FUNCTION store_idempotency_response(
    p_user_id UUID,
    p_idempotency_key TEXT,
    p_response_data JSONB,
    p_status_code INTEGER DEFAULT 200
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO idempotency_log (user_id, idempotency_key, response_data, status_code)
    VALUES (p_user_id, p_idempotency_key, p_response_data, p_status_code)
    ON CONFLICT (user_id, idempotency_key) 
    DO UPDATE SET 
        response_data = EXCLUDED.response_data,
        status_code = EXCLUDED.status_code,
        created_at = NOW()
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Function to get idempotency response
CREATE OR REPLACE FUNCTION get_idempotency_response(
    p_user_id UUID,
    p_idempotency_key TEXT,
    p_max_age_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    response_data JSONB,
    status_code INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        il.response_data,
        il.status_code,
        il.created_at
    FROM idempotency_log il
    WHERE 
        il.user_id = p_user_id
        AND il.idempotency_key = p_idempotency_key
        AND il.created_at >= NOW() - (p_max_age_hours || ' hours')::INTERVAL
    ORDER BY il.created_at DESC
    LIMIT 1;
END;
$$;

-- Create a view for monitoring rate limit violations
CREATE OR REPLACE VIEW rate_limit_violations AS
SELECT 
    user_id,
    operation,
    COUNT(*) as violation_count,
    MAX(created_at) as last_violation,
    date_trunc('hour', created_at) as violation_hour
FROM rate_limit_log
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id, operation, date_trunc('hour', created_at)
HAVING 
    (operation = 'transfer' AND COUNT(*) > 10) OR
    (operation = 'withdraw' AND COUNT(*) > 2) OR
    (operation = 'deposit' AND COUNT(*) > 50) OR
    (operation = 'balance' AND COUNT(*) > 100)
ORDER BY violation_count DESC, last_violation DESC;

-- Grant necessary permissions
GRANT SELECT ON rate_limit_violations TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_rate_limit_logs() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_idempotency_logs() TO service_role;
GRANT EXECUTE ON FUNCTION get_rate_limit_stats(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_rate_limited(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_rate_limit_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_api_request(UUID, TEXT, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION store_idempotency_response(UUID, TEXT, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_idempotency_response(UUID, TEXT, INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE rate_limit_log IS 'Logs API requests for rate limiting purposes';
COMMENT ON TABLE idempotency_log IS 'Stores idempotency keys and responses to prevent duplicate operations';
COMMENT ON FUNCTION cleanup_rate_limit_logs() IS 'Removes rate limit logs older than 7 days';
COMMENT ON FUNCTION cleanup_idempotency_logs() IS 'Removes idempotency logs older than 30 days';
COMMENT ON FUNCTION get_rate_limit_stats(UUID, TEXT, INTEGER) IS 'Returns rate limiting statistics for monitoring';
COMMENT ON FUNCTION is_rate_limited(UUID, TEXT, INTEGER, INTEGER) IS 'Checks if a user has exceeded rate limits';
COMMENT ON VIEW rate_limit_violations IS 'Shows users who have exceeded rate limits in the last 24 hours';