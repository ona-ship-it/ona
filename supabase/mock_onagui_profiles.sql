-- SQL script to add mock profiles to the onagui_profiles table in Supabase

-- ========================================== 
-- Function to create a matching onagui_profiles row 
-- ========================================== 
DO $$ 
BEGIN
  -- Only create the function if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_proc WHERE proname = 'handle_new_user'
  ) THEN
    CREATE OR REPLACE FUNCTION handle_new_user() 
    RETURNS trigger AS $FUNC$ 
    BEGIN 
      INSERT INTO public.onagui_profiles (id, username, full_name, avatar_url, onagui_type) 
      VALUES ( 
        new.id, 
        split_part(new.email, '@', 1),  -- default username from email 
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'avatar_url', 
        'signed_in' 
      ); 
      RETURN new; 
    END; 
    $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create the trigger
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created 
    AFTER INSERT ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- VIP user
INSERT INTO onagui_profiles (id, username, full_name, avatar_url, onagui_type, created_at)
VALUES 
  (gen_random_uuid(), 'vip_member', 'VIP Member', 'https://i.pravatar.cc/150?u=vip', 'vip', '2023-01-15T10:30:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  onagui_type = EXCLUDED.onagui_type,
  updated_at = now();

-- Active user
INSERT INTO onagui_profiles (id, username, full_name, avatar_url, onagui_type, created_at)
VALUES 
  (gen_random_uuid(), 'active_user', 'Active Participant', 'https://i.pravatar.cc/150?u=active', 'active', '2023-03-20T14:45:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  onagui_type = EXCLUDED.onagui_type,
  updated_at = now();

-- Empowered user (influencer)
INSERT INTO onagui_profiles (id, username, full_name, avatar_url, onagui_type, created_at)
VALUES 
  (gen_random_uuid(), 'influencer', 'Social Influencer', 'https://i.pravatar.cc/150?u=influencer', 'empowered', '2023-05-10T09:15:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  onagui_type = EXCLUDED.onagui_type,
  updated_at = now();

-- New user (signed_in)
INSERT INTO onagui_profiles (id, username, full_name, avatar_url, onagui_type, created_at)
VALUES 
  (gen_random_uuid(), 'new_member', 'New Member', 'https://i.pravatar.cc/150?u=new', 'signed_in', '2023-09-05T16:20:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  onagui_type = EXCLUDED.onagui_type,
  updated_at = now();

-- Subscriber user
INSERT INTO onagui_profiles (id, username, full_name, avatar_url, onagui_type, created_at)
VALUES 
  (gen_random_uuid(), 'subscriber', 'Verified Subscriber', 'https://i.pravatar.cc/150?u=subscriber', 'subscriber', '2023-07-12T11:30:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  onagui_type = EXCLUDED.onagui_type,
  updated_at = now();

-- Insert user achievements
-- First, create variables to store the UUIDs
DO $$
DECLARE
    vip_id UUID;
    active_id UUID;
    influencer_id UUID;
    new_user_id UUID;
    subscriber_id UUID;
BEGIN
    -- Get the IDs of the profiles we just inserted
    SELECT id INTO vip_id FROM onagui_profiles WHERE username = 'vip_member' LIMIT 1;
    SELECT id INTO active_id FROM onagui_profiles WHERE username = 'active_user' LIMIT 1;
    SELECT id INTO influencer_id FROM onagui_profiles WHERE username = 'influencer' LIMIT 1;
    SELECT id INTO new_user_id FROM onagui_profiles WHERE username = 'new_member' LIMIT 1;
    SELECT id INTO subscriber_id FROM onagui_profiles WHERE username = 'subscriber' LIMIT 1;
    
    -- VIP user achievements
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT vip_id, id FROM achievements WHERE code = 'first_signin'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT vip_id, id FROM achievements WHERE code = 'first_ticket'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT vip_id, id FROM achievements WHERE code = 'first_deposit'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT vip_id, id FROM achievements WHERE code = 'vip_status'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT vip_id, id FROM achievements WHERE code = 'verified_user'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Active user achievements
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT active_id, id FROM achievements WHERE code = 'first_signin'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT active_id, id FROM achievements WHERE code = 'first_ticket'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT active_id, id FROM achievements WHERE code = 'verified_user'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Empowered user achievements
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT influencer_id, id FROM achievements WHERE code = 'first_signin'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT influencer_id, id FROM achievements WHERE code = 'first_ticket'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- New user achievements
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT new_user_id, id FROM achievements WHERE code = 'first_signin'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Subscriber user achievements
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT subscriber_id, id FROM achievements WHERE code = 'first_signin'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT subscriber_id, id FROM achievements WHERE code = 'verified_user'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
END $$;