-- Fix ambiguous column reference in create_health_snapshot function
-- Replaces variable and qualifies column references to avoid ambiguity

CREATE OR REPLACE FUNCTION public.create_health_snapshot() RETURNS UUID AS $$
DECLARE
    snapshot_id UUID;
    services_json JSONB;
    overall_health TEXT;
    critical_error_count INTEGER;
BEGIN
    -- Aggregate service data with qualified column references
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
        WHEN critical_error_count > 0 THEN 'unhealthy'
        WHEN EXISTS (SELECT 1 FROM public.service_status s WHERE s.status = 'error') THEN 'degraded'
        ELSE 'healthy'
    END;
    
    -- Insert snapshot
    INSERT INTO public.service_health_snapshots (overall_status, services_data, alerts_count)
    VALUES (overall_health, services_json, critical_error_count)
    RETURNING id INTO snapshot_id;
    
    RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_health_snapshot TO anon, authenticated;