-- Setup test user with admin privileges
-- User ID: 87a61fd8-73f1-4bb4-8777-845c2258718f
-- Email: e2e.user.1760573088907@mailinator.com

-- Insert into app_users table
INSERT INTO app_users (id, email, username, current_rank, reputation_points)
VALUES (
  '87a61fd8-73f1-4bb4-8777-845c2258718f'::UUID,
  'e2e.user.1760573088907@mailinator.com',
  'test_admin_user',
  'vip',
  1000
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  current_rank = EXCLUDED.current_rank,
  reputation_points = EXCLUDED.reputation_points;

-- Assign admin role to the test user
DO $$
DECLARE
  admin_role_id UUID;
  test_user_id UUID := '87a61fd8-73f1-4bb4-8777-845c2258718f'::UUID;
BEGIN
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM onagui.roles WHERE name = 'admin';
  
  -- Assign the admin role to the test user
  IF admin_role_id IS NOT NULL THEN
    INSERT INTO onagui.user_roles (user_id, role_id)
    VALUES (test_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
END $$;