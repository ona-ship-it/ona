-- Complete Admin Setup and Test Script for Supabase
-- This script sets up the admin user and creates test data to verify immediate activation functionality

-- 1. First, fix the schema by adding the missing description column to onagui.roles
ALTER TABLE onagui.roles 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Ensure the schemas and tables exist
CREATE SCHEMA IF NOT EXISTS onagui;

-- 3. Create user_roles table with proper foreign key to auth.users
CREATE TABLE IF NOT EXISTS onagui.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES onagui.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Add created_at column if it doesn't exist (for existing tables)
ALTER TABLE onagui.user_roles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Create app_users table if it doesn't exist (public schema)
CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  current_rank TEXT DEFAULT 'user',
  reputation_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4b. Create onagui.app_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS onagui.app_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  profile_image TEXT,
  current_rank TEXT DEFAULT 'user',
  reputation_points INTEGER DEFAULT 0,
  onagui_type TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4c. Add last_active_at column to onagui.app_users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'onagui' 
        AND table_name = 'app_users' 
        AND column_name = 'last_active_at'
    ) THEN
        ALTER TABLE onagui.app_users 
        ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Added last_active_at column to onagui.app_users';
    END IF;
END $$;

-- 5. Insert admin role
INSERT INTO onagui.roles (name, description)
VALUES ('admin', 'Application administrator with full access')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 6. Insert other roles for completeness
INSERT INTO onagui.roles (name, description) VALUES
  ('user', 'Regular user'),
  ('subscriber', 'Subscribed user with additional privileges'),
  ('influencer', 'Content creator with special privileges')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 7. Set up the specific admin user
-- Using the provided admin credentials: richtheocrypto@gmail.com
DO $$
DECLARE
  admin_user_id UUID := 'b5b32b5d-e800-42ae-9d0b-4a77e70c4aa3'::UUID;
  admin_user_email TEXT := 'richtheocrypto@gmail.com';
  admin_role_id UUID;
  user_exists BOOLEAN := FALSE;
BEGIN
  -- Check if the admin user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = admin_user_id) INTO user_exists;
  
  IF user_exists THEN
    -- Create/update app_users entry for the admin user (public schema)
    INSERT INTO public.app_users (id, email, username, current_rank, reputation_points)
    VALUES (
      admin_user_id,
      admin_user_email,
      'richtheocrypto',
      'admin',
      1000
    ) ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      username = EXCLUDED.username,
      current_rank = EXCLUDED.current_rank,
      reputation_points = EXCLUDED.reputation_points;
    
    -- Create/update onagui.app_users entry for the admin user
    INSERT INTO onagui.app_users (
      id, 
      email, 
      username, 
      full_name, 
      current_rank, 
      reputation_points, 
      onagui_type,
      last_active_at
    ) VALUES (
      admin_user_id,
      admin_user_email,
      'richtheocrypto',
      'Rich Theo Crypto',
      'admin',
      1000,
      'vip',
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      username = EXCLUDED.username,
      full_name = EXCLUDED.full_name,
      current_rank = EXCLUDED.current_rank,
      reputation_points = EXCLUDED.reputation_points,
      onagui_type = EXCLUDED.onagui_type,
      last_active_at = EXCLUDED.last_active_at,
      updated_at = NOW();
    
    -- Get the admin role ID
    SELECT id INTO admin_role_id FROM onagui.roles WHERE name = 'admin';
    
    -- Assign admin role to this user
    IF admin_role_id IS NOT NULL THEN
      INSERT INTO onagui.user_roles (user_id, role_id)
      VALUES (admin_user_id, admin_role_id)
      ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
    
    -- Create a test giveaway for this admin user
    INSERT INTO public.giveaways (
      id,
      creator_id,
      title,
      description,
      prize_amount,
      prize_pool_usdt,
      ticket_price,
      status,
      is_active,
      escrow_amount,
      ends_at,
      created_at
    ) VALUES (
      uuid_generate_v4(),
      admin_user_id,
      'Admin Test Giveaway - Immediate Activation',
      'Test giveaway created by admin to verify immediate activation functionality',
      100.00,
      100.00,
      1.00,
      'active',
      true,
      0.00, -- No escrow required for admin
      NOW() + INTERVAL '7 days',
      NOW()
    ) ON CONFLICT DO NOTHING;
    
    -- Output the user info for reference
    RAISE NOTICE 'Admin setup completed for user: % (ID: %)', admin_user_email, admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user % (ID: %) not found in auth.users. Please ensure this user is signed up first.', admin_user_email, admin_user_id;
  END IF;
END $$;

-- 8. Verification queries to check the setup
-- Run these to verify everything is set up correctly:

-- Check if admin role exists
SELECT 'Admin role check:' as check_type, * FROM onagui.roles WHERE name = 'admin';

-- Check admin users in app_users
SELECT 'Admin app users:' as check_type, id, email, username, current_rank 
FROM public.app_users 
WHERE current_rank = 'admin';

-- Check admin role assignments
SELECT 'Admin role assignments:' as check_type, 
       au.email, 
       app_u.username,
       r.name as role_name,
       ur.created_at as assigned_at
FROM onagui.user_roles ur
JOIN onagui.roles r ON ur.role_id = r.id
JOIN auth.users au ON ur.user_id = au.id
LEFT JOIN public.app_users app_u ON app_u.id = au.id
WHERE r.name = 'admin';

-- Check admin giveaways
SELECT 'Admin giveaways:' as check_type, 
       g.id, 
       g.title, 
       g.status, 
       g.is_active, 
       g.escrow_amount,
       au.email as creator_email,
       app_u.username as creator_username
FROM public.giveaways g
JOIN auth.users au ON g.creator_id = au.id
LEFT JOIN public.app_users app_u ON app_u.id = au.id
JOIN onagui.user_roles ur ON ur.user_id = au.id
JOIN onagui.roles r ON ur.role_id = r.id
WHERE r.name = 'admin'
ORDER BY g.created_at DESC
LIMIT 5;

-- 9. Instructions for next steps:
/*
NEXT STEPS AFTER RUNNING THIS SCRIPT:

1. The script sets up the specific admin user:
   - Email: richtheocrypto@gmail.com
   - User ID: a442b26f-4534-401f-841c-26bae4c90329
   - If this user doesn't exist in auth.users, sign up with this email first

2. Sign in with the admin email: richtheocrypto@gmail.com

3. Navigate to the giveaways page and verify:
   - You can see the "Activate immediately" checkbox (admin privilege)
   - Create a new giveaway with immediate activation
   - Verify it shows as active with 0 escrow

4. Test the admin functionality:
   - Go to /admin/users to see the admin panel
   - Verify you can access admin-only features

5. Check the test giveaway created by the script:
   - Look for "Admin Test Giveaway - Immediate Activation"
   - Verify it has status 'active' and escrow_amount 0.00

The admin user is set up with both authentication methods:
- current_rank = 'admin' in app_users table
- admin role assignment in user_roles table

This ensures compatibility with both authentication methods used in the application.
*/