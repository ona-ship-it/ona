-- Add admin type to onagui_user_type enum
ALTER TYPE onagui_user_type ADD VALUE IF NOT EXISTS 'admin';

-- Create an admin user for testing
INSERT INTO onagui_profiles (id, username, full_name, avatar_url, onagui_type, created_at)
VALUES 
  (gen_random_uuid(), 'admin_user', 'Admin User', 'https://i.pravatar.cc/150?u=admin', 'admin', now())
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  onagui_type = EXCLUDED.onagui_type,
  updated_at = now();