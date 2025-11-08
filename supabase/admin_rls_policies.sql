-- Enable RLS on roles table
ALTER TABLE onagui.roles ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for roles table
DROP POLICY IF EXISTS roles_admin_only ON onagui.roles;
CREATE POLICY roles_admin_only ON onagui.roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create read-only policy for authenticated users
DROP POLICY IF EXISTS roles_read_only ON onagui.roles;
CREATE POLICY roles_read_only ON onagui.roles
  FOR SELECT
  USING (true);

-- Enable RLS on user_roles table
ALTER TABLE onagui.user_roles ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for user_roles table
DROP POLICY IF EXISTS user_roles_admin_only ON onagui.user_roles;
CREATE POLICY user_roles_admin_only ON onagui.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create read-only policy for users to see their own roles
DROP POLICY IF EXISTS user_roles_read_own ON onagui.user_roles;
CREATE POLICY user_roles_read_own ON onagui.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Enable RLS on winners table
ALTER TABLE onagui.winners ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for winners table
DROP POLICY IF EXISTS winners_admin_only ON onagui.winners;
CREATE POLICY winners_admin_only ON onagui.winners
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create read-only policy for winners table (public can view winners)
DROP POLICY IF EXISTS winners_read_only ON onagui.winners;
CREATE POLICY winners_read_only ON onagui.winners
  FOR SELECT
  USING (true);