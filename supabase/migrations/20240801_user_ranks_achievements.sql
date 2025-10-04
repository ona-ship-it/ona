-- Ensure required extension 
CREATE EXTENSION IF NOT EXISTS pgcrypto; 
 
-- Ensure schema for onagui objects 
CREATE SCHEMA IF NOT EXISTS onagui; 
 
-- ENUM for user types (create only if missing) 
DO $$ 
BEGIN 
  IF NOT EXISTS ( 
    SELECT 1 
    FROM pg_type t 
    JOIN pg_namespace n ON n.oid = t.typnamespace 
    WHERE t.typname = 'onagui_user_type' 
      AND n.nspname = current_schema() 
  ) THEN 
    CREATE TYPE onagui_user_type AS ENUM ( 
      'vip', 
      'active', 
      'empowered', 
      'signed_in', 
      'subscriber' 
    ); 
  END IF; 
END; 
$$; 
 
-- Ranks 
CREATE TABLE IF NOT EXISTS ranks ( 
  code text PRIMARY KEY, 
  name text NOT NULL, 
  description text, 
  requirements jsonb, 
  badge_icon text 
); 
 
INSERT INTO ranks (code, name, description, requirements, badge_icon) 
VALUES 
  ('new_user', 'New User', 'Entry rank with limited actions', '{"max_days": 3}', '🎟️'), 
  ('subscriber', 'Subscriber', 'Verified user with ≥3 verifications', '{"min_verifications": 3}', '🔐'), 
  ('onagui_user', 'Active User', 'KYC + active participation', '{"kyc": true, "min_giveaways": 1}', '💎'), 
  ('powered', 'Powered by Onagui', 'Verified influencer with multiple giveaways', '{"min_successful_giveaways": 3}', '⚡'), 
  ('vip', 'Onagui VIP', 'Invite-only elite rank', '{"invite_only": true}', '👑') 
ON CONFLICT (code) DO NOTHING; 
 
-- App users 
CREATE TABLE IF NOT EXISTS app_users ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  email text UNIQUE, 
  username text UNIQUE, 
  profile_image text, 
  current_rank text REFERENCES ranks(code) DEFAULT 'new_user', 
  reputation_points int DEFAULT 0, 
  created_at timestamptz DEFAULT now(), 
  last_active_at timestamptz 
); 
 
-- Achievements 
CREATE TABLE IF NOT EXISTS achievements ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  code text UNIQUE NOT NULL, 
  name text NOT NULL, 
  description text, 
  icon_url text, 
  points int DEFAULT 0, 
  created_at timestamptz DEFAULT now() 
); 
 
INSERT INTO achievements (code, name, description, points) 
VALUES 
  ('first_signin', 'Welcome Aboard', 'Signed in to Onagui for the first time', 10), 
  ('first_ticket', 'Ticket Explorer', 'Used or bought your first ticket', 20), 
  ('first_deposit', 'Wallet Starter', 'Made your first deposit', 30), 
  ('vip_status', 'Onagui VIP', 'Achieved VIP membership', 100), 
  ('verified_user', 'Trusted User', 'Completed ID verification and became a Subscriber', 50) 
ON CONFLICT (code) DO NOTHING; 
 
-- Update onagui_profiles table to include rank reference
ALTER TABLE IF EXISTS onagui_profiles 
ADD COLUMN IF NOT EXISTS current_rank text REFERENCES ranks(code) DEFAULT 'new_user',
ADD COLUMN IF NOT EXISTS reputation_points int DEFAULT 0;
 
-- User Achievements 
CREATE TABLE IF NOT EXISTS user_achievements ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  user_id uuid REFERENCES onagui_profiles(id) ON DELETE CASCADE, 
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE, 
  unlocked_at timestamptz DEFAULT now(), 
  UNIQUE(user_id, achievement_id) 
); 
 
-- Verifications 
CREATE TABLE IF NOT EXISTS user_verifications ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE, 
  type text NOT NULL, 
  status text CHECK (status IN ('pending','verified','rejected')) DEFAULT 'pending', 
  verified_at timestamptz 
); 
 
-- Badges 
CREATE TABLE IF NOT EXISTS user_badges ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE, 
  badge_code text NOT NULL, 
  name text NOT NULL, 
  icon text, 
  earned_at timestamptz DEFAULT now() 
); 
 
INSERT INTO user_badges (user_id, badge_code, name, icon) 
VALUES 
  (NULL, 'newcomer', 'Newcomer', '🎟️'), 
  (NULL, 'verified', 'Verified Subscriber', '🔐'), 
  (NULL, 'capitano', 'Capitano', '⚓'), 
  (NULL, 'powered', 'Powered by Onagui', '⚡'), 
  (NULL, 'vip', 'VIP', '👑') 
ON CONFLICT DO NOTHING; 
 
-- Transactions 
CREATE TABLE IF NOT EXISTS transactions ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE, 
  type text CHECK (type IN ('ticket','deposit','withdraw')), 
  amount numeric(12,2) NOT NULL, 
  currency text DEFAULT 'TICKET', 
  status text CHECK (status IN ('pending','completed','failed')) DEFAULT 'pending', 
  created_at timestamptz DEFAULT now() 
); 
 
-- Activities 
CREATE TABLE IF NOT EXISTS activities ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE, 
  action text NOT NULL, 
  metadata jsonb, 
  created_at timestamptz DEFAULT now() 
); 
 
-- Trigger function in onagui schema 
CREATE OR REPLACE FUNCTION onagui.trigger_set_timestamp() 
RETURNS trigger AS $$ 
BEGIN 
  NEW.updated_at := now(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql; 
 
-- Attach trigger 
DROP TRIGGER IF EXISTS set_timestamp ON onagui_profiles; 
CREATE TRIGGER set_timestamp 
BEFORE UPDATE ON onagui_profiles 
FOR EACH ROW 
EXECUTE PROCEDURE onagui.trigger_set_timestamp(); 
 
-- Indexes 
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON user_verifications(user_id); 
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id); 
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id); 
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);