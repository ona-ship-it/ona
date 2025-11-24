-- =========================================================
-- 🗃️ ONAGUI AUTH RESTRUCTURE: ROLE-BASED ADMIN CONTROL
-- =========================================================

-- 1️⃣ Create a roles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

-- 2️⃣ Create user_roles join table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles (id) ON DELETE CASCADE,
  UNIQUE (user_id, role_id)
);

-- 3️⃣ Insert default roles
INSERT INTO public.roles (name, description)
VALUES
  ('admin', 'Full administrative access'),
  ('user', 'Standard authenticated user')
ON CONFLICT (name) DO NOTHING;

-- 4️⃣ Add optional is_admin flag (for quick lookup)
ALTER TABLE public.onagui_profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 5️⃣ Add 'admin' to onagui_type ENUM (for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'onagui_user_type'
      AND e.enumlabel = 'admin'
  ) THEN
    ALTER TYPE onagui_user_type ADD VALUE 'admin';
  END IF;
END$$;

-- 6️⃣ Standardize admin RPC
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM public.onagui_profiles p
    WHERE p.id = user_uuid AND (p.is_admin = TRUE OR p.onagui_type = 'admin')
  );
END;
$$;

-- 7️⃣ Assign admin role to your main account
INSERT INTO public.user_roles (user_id, role_id)
SELECT
  u.id,
  (SELECT id FROM public.roles WHERE name = 'admin')
FROM auth.users u
WHERE u.email = 'richtheocrypto@gmail.com'
ON CONFLICT DO NOTHING;

-- 8️⃣ Also mark admin in profile
UPDATE public.onagui_profiles
SET is_admin = TRUE, onagui_type = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'richtheocrypto@gmail.com');

-- 9️⃣ Also assign admin role to samiraeddaoudi88@gmail.com
INSERT INTO public.user_roles (user_id, role_id)
SELECT
  u.id,
  (SELECT id FROM public.roles WHERE name = 'admin')
FROM auth.users u
WHERE u.email = 'samiraeddaoudi88@gmail.com'
ON CONFLICT DO NOTHING;

-- 🔟 Mark samiraeddaoudi88@gmail.com as admin in profile
UPDATE public.onagui_profiles
SET is_admin = TRUE, onagui_type = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'samiraeddaoudi88@gmail.com');