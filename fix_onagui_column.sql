-- Fix missing last_active_at column in onagui.app_users
-- This script safely adds the column only if it doesn't exist

DO $$
BEGIN
    -- Check if the column exists and add it if it doesn't
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
    ELSE
        RAISE NOTICE 'Column last_active_at already exists in onagui.app_users';
    END IF;
END $$;

-- Now insert/update the admin user safely
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
    'b5b32b5d-e800-42ae-9d0b-4a77e70c4aa3',
    'richtheocrypto@gmail.com',
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

-- Verify the admin user was added/updated
SELECT 
    id, 
    email, 
    username, 
    current_rank, 
    reputation_points,
    last_active_at,
    created_at,
    updated_at
FROM onagui.app_users 
WHERE email = 'richtheocrypto@gmail.com';

-- Success message
SELECT 'Admin user setup completed successfully!' as status;