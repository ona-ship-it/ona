-- Helper functions for admin user management
-- These functions allow the Node.js script to interact with the onagui schema

-- Function to get admin role ID
CREATE OR REPLACE FUNCTION public.get_admin_role_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = onagui, public
AS $$
DECLARE
    role_id uuid;
BEGIN
    SELECT id INTO role_id 
    FROM onagui.roles 
    WHERE name = 'admin';
    
    RETURN role_id;
END;
$$;

-- Function to create admin role if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_admin_role()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = onagui, public
AS $$
DECLARE
    role_id uuid;
BEGIN
    INSERT INTO onagui.roles (name, description)
    VALUES ('admin', 'Application administrator with full app access')
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO role_id;
    
    -- If no row was inserted (conflict), get the existing ID
    IF role_id IS NULL THEN
        SELECT id INTO role_id 
        FROM onagui.roles 
        WHERE name = 'admin';
    END IF;
    
    RETURN role_id;
END;
$$;

-- Function to check if user has admin role
CREATE OR REPLACE FUNCTION public.user_has_admin_role(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = onagui, public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM onagui.user_roles ur
        JOIN onagui.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid 
        AND r.name = 'admin'
    );
END;
$$;

-- Function to assign admin role to user
CREATE OR REPLACE FUNCTION public.assign_admin_role(user_uuid uuid, role_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = onagui, public
AS $$
BEGIN
    INSERT INTO onagui.user_roles (user_id, role_id)
    VALUES (user_uuid, role_uuid)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Function to check if profile exists
CREATE OR REPLACE FUNCTION public.profile_exists(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = onagui, public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM onagui.onagui_profiles 
        WHERE id = user_uuid
    );
END;
$$;

-- Function to create or update admin profile
CREATE OR REPLACE FUNCTION public.ensure_admin_profile(
    user_uuid uuid,
    user_email text,
    user_username text DEFAULT NULL,
    user_full_name text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = onagui, public
AS $$
BEGIN
    INSERT INTO onagui.onagui_profiles (
        id, 
        email, 
        username, 
        full_name, 
        is_admin, 
        onagui_type
    )
    VALUES (
        user_uuid,
        user_email,
        COALESCE(user_username, split_part(user_email, '@', 1)),
        COALESCE(user_full_name, split_part(user_email, '@', 1)),
        true,
        'admin'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        is_admin = true,
        onagui_type = 'admin',
        updated_at = now();
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_admin_role_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_admin_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_has_admin_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.assign_admin_role(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.profile_exists(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ensure_admin_profile(uuid, text, text, text) TO authenticated, service_role;