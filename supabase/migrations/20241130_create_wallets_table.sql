-- Create wallets table for storing user wallet balances
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_fiat NUMERIC(15,2) DEFAULT 0.00,
  balance_tickets INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own wallet
DROP POLICY IF EXISTS wallets_select ON public.wallets;
CREATE POLICY wallets_select ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own wallet (for balance changes)
DROP POLICY IF EXISTS wallets_update ON public.wallets;
CREATE POLICY wallets_update ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to manage all wallets
DROP POLICY IF EXISTS admin_wallets ON public.wallets;
CREATE POLICY admin_wallets ON public.wallets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );