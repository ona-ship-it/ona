-- Create user_crypto_wallets table for storing user-specific crypto addresses
CREATE TABLE IF NOT EXISTS user_crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('solana', 'ethereum', 'bitcoin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, network)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_crypto_wallets_user_id ON user_crypto_wallets(user_id);

-- Create index on network for faster queries
CREATE INDEX IF NOT EXISTS idx_user_crypto_wallets_network ON user_crypto_wallets(network);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_user_crypto_wallets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_crypto_wallets_updated_at
BEFORE UPDATE ON user_crypto_wallets
FOR EACH ROW
EXECUTE FUNCTION update_user_crypto_wallets_updated_at();

-- Enable RLS on user_crypto_wallets
ALTER TABLE user_crypto_wallets ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own crypto wallets
CREATE POLICY user_crypto_wallets_select ON user_crypto_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to manage all crypto wallets
CREATE POLICY admin_crypto_wallets ON user_crypto_wallets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_user_crypto_wallets_updated_at() TO authenticated;

-- Grant necessary permissions for the tables
GRANT INSERT ON public.wallets TO postgres;
GRANT INSERT ON public.user_crypto_wallets TO postgres;