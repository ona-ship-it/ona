-- Fix admin and wallet RPCs to align with public schema
-- Provides safe implementations that avoid FK violations and match runtime expectations

-- Canonical admin checker in public schema
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN (
    -- Role-based admin (preferred)
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = user_uuid
        AND r.name = 'admin'
    )
    -- Legacy profile fallback if table exists
    OR EXISTS (
      SELECT 1
      FROM public.onagui_profiles p
      WHERE p.id = user_uuid
        AND (p.is_admin = TRUE OR p.onagui_type = 'admin')
    )
  );
END;
$$;

-- Wrapper kept for backwards compatibility used by existing policies
CREATE OR REPLACE FUNCTION onagui.is_admin_user(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, onagui
AS $$
  SELECT public.is_admin_user($1);
$$;

-- Ensure a wallet row exists if the user exists in auth.users
CREATE OR REPLACE FUNCTION public.ensure_user_wallet(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Only insert if the auth user exists to avoid FK violations
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    INSERT INTO public.wallets (user_id, balance_fiat, balance_tickets, created_at)
    VALUES (p_user_id, COALESCE((SELECT balance_fiat FROM public.wallets WHERE user_id = p_user_id), 0), COALESCE((SELECT balance_tickets FROM public.wallets WHERE user_id = p_user_id), 0), now())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN p_user_id;
  END IF;

  -- If the auth user does not exist, return NULL and do nothing
  RETURN NULL;
END;
$$;

-- Add funds to fiat balance (public schema)
CREATE OR REPLACE FUNCTION public.add_funds_to_wallet_fiat(user_uuid uuid, amount_to_add numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_user_wallet(user_uuid);

  UPDATE public.wallets
  SET balance_fiat = COALESCE(balance_fiat, 0) + amount_to_add,
      updated_at = now()
  WHERE user_id = user_uuid;

  RETURN FOUND;
END;
$$;

-- Deduct funds from fiat balance with safety check
CREATE OR REPLACE FUNCTION public.deduct_funds_from_wallet_fiat(user_uuid uuid, amount_to_deduct numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur_balance numeric;
BEGIN
  SELECT balance_fiat INTO cur_balance FROM public.wallets WHERE user_id = user_uuid;

  IF cur_balance IS NULL OR cur_balance < amount_to_deduct THEN
    RETURN false;
  END IF;

  UPDATE public.wallets
  SET balance_fiat = balance_fiat - amount_to_deduct,
      updated_at = now()
  WHERE user_id = user_uuid;

  RETURN FOUND;
END;
$$;

-- Optional grants for application roles
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION onagui.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_wallet(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_funds_to_wallet_fiat(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_funds_from_wallet_fiat(uuid, numeric) TO authenticated;