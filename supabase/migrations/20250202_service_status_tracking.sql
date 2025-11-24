-- Service Status Tracking Migration
-- This migration adds a table to track the status of wallet services for better monitoring

-- Service status table to track individual service states
CREATE TABLE IF NOT EXISTS public.service_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('initializing', 'running', 'error', 'stopped')),
    is_critical BOOLEAN NOT NULL DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    error_count INTEGER DEFAULT 0,
    restart_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service health snapshots for historical tracking
CREATE TABLE IF NOT EXISTS public.service_health_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    overall_status TEXT NOT NULL CHECK (overall_status IN ('healthy', 'degraded', 'unhealthy')),
    services_data JSONB NOT NULL,
    metrics_data JSONB DEFAULT '{}',
    alerts_count INTEGER DEFAULT 0,
    snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_status_name ON public.service_status(service_name);
CREATE INDEX IF NOT EXISTS idx_service_status_status ON public.service_status(status);
CREATE INDEX IF NOT EXISTS idx_service_status_critical ON public.service_status(is_critical);
CREATE INDEX IF NOT EXISTS idx_service_status_updated ON public.service_status(updated_at);
CREATE INDEX IF NOT EXISTS idx_service_health_snapshots_at ON public.service_health_snapshots(snapshot_at);

-- Add RLS policies
ALTER TABLE public.service_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_health_snapshots ENABLE ROW LEVEL SECURITY;

-- Service status policies (system and admin access)
CREATE POLICY "System can manage service status" ON public.service_status
    FOR ALL USING (true);

CREATE POLICY "Admins can view service status" ON public.service_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.onagui_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Service health snapshots policies
CREATE POLICY "System can manage health snapshots" ON public.service_health_snapshots
    FOR ALL USING (true);

CREATE POLICY "Admins can view health snapshots" ON public.service_health_snapshots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.onagui_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Insert initial service records
INSERT INTO public.service_status (service_name, status, is_critical, metadata) VALUES
    ('Hot Wallet Service', 'initializing', true, '{"description": "Core wallet service for transaction processing"}'),
    ('On-Chain Monitor', 'initializing', false, '{"description": "Monitors blockchain for deposits and confirmations"}'),
    ('Withdrawal Worker', 'initializing', false, '{"description": "Processes pending withdrawal requests"}'),
    ('Reconciliation Monitor', 'initializing', false, '{"description": "Monitors balance discrepancies between ledger and blockchain"}')
ON CONFLICT (service_name) DO NOTHING;

-- Function to update service status with automatic timestamp
CREATE OR REPLACE FUNCTION update_service_status(
    p_service_name TEXT,
    p_status TEXT,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
    UPDATE public.service_status 
    SET 
        status = p_status,
        error_message = CASE WHEN p_status = 'error' THEN p_error_message ELSE NULL END,
        error_count = CASE WHEN p_status = 'error' THEN error_count + 1 ELSE error_count END,
        metadata = COALESCE(p_metadata, metadata),
        last_activity = NOW(),
        updated_at = NOW()
    WHERE service_name = p_service_name;
    
    -- Insert if not exists
    IF NOT FOUND THEN
        INSERT INTO public.service_status (service_name, status, error_message, metadata)
        VALUES (p_service_name, p_status, p_error_message, COALESCE(p_metadata, '{}'));
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create health snapshot
CREATE OR REPLACE FUNCTION create_health_snapshot() RETURNS UUID AS $$
DECLARE
    snapshot_id UUID;
    services_json JSONB;
    overall_health TEXT;
    critical_error_count INTEGER;
BEGIN
    -- Aggregate service data
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'name', ss.service_name,
                'status', ss.status,
                'is_critical', ss.is_critical,
                'last_activity', ss.last_activity,
                'error_message', ss.error_message,
                'error_count', ss.error_count
            )
        ),
        COUNT(*) FILTER (WHERE ss.status = 'error' AND ss.is_critical = true)
    INTO services_json, critical_error_count
    FROM public.service_status ss;
    
    -- Determine overall health
    overall_health := CASE 
        WHEN error_count > 0 THEN 'unhealthy'
        WHEN EXISTS (SELECT 1 FROM public.service_status WHERE status = 'error') THEN 'degraded'
        ELSE 'healthy'
    END;
    
    -- Insert snapshot
    INSERT INTO public.service_health_snapshots (overall_status, services_data, alerts_count)
    VALUES (overall_health, services_json, error_count)
    RETURNING id INTO snapshot_id;
    
    RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.service_status TO anon, authenticated;
GRANT SELECT ON public.service_health_snapshots TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_service_status TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_health_snapshot TO anon, authenticated;