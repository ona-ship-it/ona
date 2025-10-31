-- Migration: Extend user signup trigger to create wallets and crypto addresses
-- This extends the existing sync_auth_user_to_app_users function to also create
-- wallet records and generate crypto addresses for new users

-- First, let's create a function to generate a random Solana-like address
-- Note: This is a placeholder function. In production, you'd want to use proper
-- crypto libraries or call an external service for real key generation
CREATE OR REPLACE FUNCTION generate_placeholder_solana_address()
RETURNS TEXT AS $$
BEGIN
  -- Generate a base58-like string (44 characters, similar to Solana addresses)
  -- This is just a placeholder - real implementation would use proper crypto
  RETURN encode(gen_random_bytes(32), 'base64')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the enhanced trigger function
CREATE OR REPLACE FUNCTION onagui.sync_auth_user_to_app_users()
RETURNS TRIGGER AS $$
DECLARE
  generated_address TEXT;
BEGIN
  -- Insert into onagui.app_users when a new user is created in auth.users
  INSERT INTO onagui.app_users (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, onagui.app_users.username),
    updated_at = EXCLUDED.updated_at;
  
  -- Create initial wallet record with zero balances
  INSERT INTO public.wallets (user_id, balance_fiat, balance_tickets, created_at, updated_at)
  VALUES (
    NEW.id,
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Generate a placeholder crypto address and create crypto wallet record
  -- Note: In production, this should be replaced with proper key generation
  -- using the createUserWallet function via an API call or webhook
  generated_address := generate_placeholder_solana_address();
  
  INSERT INTO user_crypto_wallets (
    user_id, 
    address, 
    encrypted_private_key, 
    network, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    generated_address,
    'PLACEHOLDER_ENCRYPTED_KEY_' || NEW.id::TEXT, -- Placeholder for encrypted key
    'solana',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, network) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: GRANT permissions are handled in the respective table creation migrations

-- Add helpful comments
COMMENT ON FUNCTION generate_placeholder_solana_address() IS 
'Generates a placeholder Solana-like address. Should be replaced with proper crypto generation in production.';

COMMENT ON FUNCTION onagui.sync_auth_user_to_app_users() IS 
'Automatically syncs new auth.users records to onagui.app_users and creates initial wallet records';