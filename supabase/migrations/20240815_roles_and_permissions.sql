-- Create roles table for application-level roles
-- These roles are used for application logic and permissions
-- They are separate from database-level roles used for schema management
CREATE TABLE IF NOT EXISTS onagui.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles join table
CREATE TABLE IF NOT EXISTS onagui.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES onagui.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

-- Insert app-level roles if they don't exist
INSERT INTO onagui.roles (name, description) 
VALUES 
  ('user', 'Basic user with limited permissions'),
  ('subscriber', 'Paid subscriber with additional features'),
  ('influencer', 'Content creator with special privileges'),
  ('admin', 'Application administrator with full app access')
ON CONFLICT (name) DO NOTHING;

-- Get the admin role ID and assign to specific user
DO $$
DECLARE
  admin_role_id UUID;
  admin_user_id UUID := 'a442b26f-4534-401f-841c-26bae4c90329'::UUID; -- Specific user ID
BEGIN
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM onagui.roles WHERE name = 'admin';
  
  -- Assign the admin role to the specific user
  IF admin_role_id IS NOT NULL THEN
    INSERT INTO onagui.user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
END $$;

-- Note: The 'admin' app role is different from the PostgreSQL 'admin' database role
-- The app role controls application logic, while the DB role manages schema

-- Create RLS policy for giveaways table
ALTER TABLE onagui.giveaways ENABLE ROW LEVEL SECURITY;

-- Policy for viewing giveaways (everyone can view)
CREATE POLICY view_giveaways ON onagui.giveaways
  FOR SELECT USING (true);

-- Policy for creating/updating/deleting giveaways (only admins)
CREATE POLICY manage_giveaways ON onagui.giveaways
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION onagui.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM onagui.user_roles ur
    JOIN onagui.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DATABASE-LEVEL ROLE MANAGEMENT
-- The following grants privileges to the PostgreSQL 'admin' database role
-- This is separate from the application-level 'admin' role defined above
-- The PostgreSQL role is used only for schema management, not daily app logic

-- Grant ALL privileges on onagui schema to PostgreSQL admin role
DO $$
BEGIN
  -- Grant privileges on all existing tables
  EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA onagui TO admin';
  
  -- Grant privileges on all existing sequences
  EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA onagui TO admin';
  
  -- Grant privileges on all existing functions
  EXECUTE 'GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA onagui TO admin';
  
  -- Grant usage on the schema itself
  EXECUTE 'GRANT USAGE ON SCHEMA onagui TO admin';
  
  -- Set default privileges for future objects
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA onagui GRANT ALL ON TABLES TO admin';
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA onagui GRANT ALL ON SEQUENCES TO admin';
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA onagui GRANT ALL ON FUNCTIONS TO admin';
END $$;

-- IMPORTANT: The PostgreSQL 'admin' role is used only for schema management
-- Application logic should use the app-level roles defined in the onagui.roles table