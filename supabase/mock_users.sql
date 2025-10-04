-- SQL script to add mock profiles to the users table in Supabase

-- VIP user with all achievements
INSERT INTO users (id, username, full_name, avatar_url, bio, email, user_type, is_verified, link_x, balance, currency, followers, following, referral_code, referral_count, created_at)
VALUES 
  ('vip-123', 'vip_member', 'VIP Member', 'https://i.pravatar.cc/150?u=vip', 'VIP member with exclusive benefits and all achievements unlocked', 'vip@example.com', 'vip', true, '@vip_member', 5000, 'USD', 1250, 350, 'VIP2023', 25, '2023-01-15T10:30:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  email = EXCLUDED.email,
  user_type = EXCLUDED.user_type,
  is_verified = EXCLUDED.is_verified,
  link_x = EXCLUDED.link_x,
  balance = EXCLUDED.balance,
  currency = EXCLUDED.currency,
  followers = EXCLUDED.followers,
  following = EXCLUDED.following,
  referral_code = EXCLUDED.referral_code,
  referral_count = EXCLUDED.referral_count,
  created_at = EXCLUDED.created_at;

-- Active user with some achievements
INSERT INTO users (id, username, full_name, avatar_url, bio, email, user_type, is_verified, link_x, balance, currency, followers, following, referral_code, referral_count, created_at)
VALUES 
  ('active-456', 'active_user', 'Active Participant', 'https://i.pravatar.cc/150?u=active', 'Regular participant in Onaqui events', 'active@example.com', 'active', true, '@active_user', 750, 'USD', 120, 85, 'ACTIVE2023', 3, '2023-03-20T14:45:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  email = EXCLUDED.email,
  user_type = EXCLUDED.user_type,
  is_verified = EXCLUDED.is_verified,
  link_x = EXCLUDED.link_x,
  balance = EXCLUDED.balance,
  currency = EXCLUDED.currency,
  followers = EXCLUDED.followers,
  following = EXCLUDED.following,
  referral_code = EXCLUDED.referral_code,
  referral_count = EXCLUDED.referral_count,
  created_at = EXCLUDED.created_at;

-- Influencer with social focus
INSERT INTO users (id, username, full_name, avatar_url, bio, email, user_type, is_verified, link_x, balance, currency, followers, following, referral_code, referral_count, created_at)
VALUES 
  ('influencer-789', 'influencer', 'Social Influencer', 'https://i.pravatar.cc/150?u=influencer', 'Growing my influence in the Onaqui community', 'influencer@example.com', 'influencer', true, '@influencer_official', 1200, 'USD', 5000, 1200, 'INFLUENCE', 15, '2023-05-10T09:15:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  email = EXCLUDED.email,
  user_type = EXCLUDED.user_type,
  is_verified = EXCLUDED.is_verified,
  link_x = EXCLUDED.link_x,
  balance = EXCLUDED.balance,
  currency = EXCLUDED.currency,
  followers = EXCLUDED.followers,
  following = EXCLUDED.following,
  referral_code = EXCLUDED.referral_code,
  referral_count = EXCLUDED.referral_count,
  created_at = EXCLUDED.created_at;

-- New user with minimal achievements
INSERT INTO users (id, username, full_name, avatar_url, bio, email, user_type, is_verified, link_x, balance, currency, followers, following, referral_code, referral_count, created_at)
VALUES 
  ('new-101', 'new_member', 'New Member', 'https://i.pravatar.cc/150?u=new', 'Just joined Onaqui!', 'new@example.com', 'new', false, '', 0, 'USD', 0, 5, 'NEWUSER', 0, '2023-09-05T16:20:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  email = EXCLUDED.email,
  user_type = EXCLUDED.user_type,
  is_verified = EXCLUDED.is_verified,
  link_x = EXCLUDED.link_x,
  balance = EXCLUDED.balance,
  currency = EXCLUDED.currency,
  followers = EXCLUDED.followers,
  following = EXCLUDED.following,
  referral_code = EXCLUDED.referral_code,
  referral_count = EXCLUDED.referral_count,
  created_at = EXCLUDED.created_at;

-- Subscriber with verification focus
INSERT INTO users (id, username, full_name, avatar_url, bio, email, user_type, is_verified, link_x, balance, currency, followers, following, referral_code, referral_count, created_at)
VALUES 
  ('subscriber-202', 'subscriber', 'Verified Subscriber', 'https://i.pravatar.cc/150?u=subscriber', 'Verified subscriber with a growing profile', 'subscriber@example.com', 'subscriber', true, '@subscriber', 250, 'USD', 45, 120, 'SUBSCRIBE', 1, '2023-07-12T11:30:00Z')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  email = EXCLUDED.email,
  user_type = EXCLUDED.user_type,
  is_verified = EXCLUDED.is_verified,
  link_x = EXCLUDED.link_x,
  balance = EXCLUDED.balance,
  currency = EXCLUDED.currency,
  followers = EXCLUDED.followers,
  following = EXCLUDED.following,
  referral_code = EXCLUDED.referral_code,
  referral_count = EXCLUDED.referral_count,
  created_at = EXCLUDED.created_at;

-- Add a completed_achievements column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'completed_achievements'
  ) THEN
    ALTER TABLE users ADD COLUMN completed_achievements TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Update completed achievements for each user
UPDATE users SET completed_achievements = ARRAY['first-login', 'profile-complete', 'first-ticket', 'social-connected', 'first-referral', 'verified-identity', 'first-purchase'] WHERE id = 'vip-123';
UPDATE users SET completed_achievements = ARRAY['first-login', 'profile-complete', 'first-ticket', 'verified-identity'] WHERE id = 'active-456';
UPDATE users SET completed_achievements = ARRAY['first-login', 'profile-complete', 'social-connected', 'first-referral'] WHERE id = 'influencer-789';
UPDATE users SET completed_achievements = ARRAY['first-login'] WHERE id = 'new-101';
UPDATE users SET completed_achievements = ARRAY['first-login', 'verified-identity', 'profile-complete'] WHERE id = 'subscriber-202';