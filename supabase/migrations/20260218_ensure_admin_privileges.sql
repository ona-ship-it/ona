-- Ensure admin privileges for known admin emails across profile and auth metadata checks
-- Date: 2026-02-18

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'onagui_user_type'
      AND n.nspname = 'public'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'onagui_user_type'
      AND n.nspname = 'public'
      AND e.enumlabel = 'admin'
  ) THEN
    ALTER TYPE public.onagui_user_type ADD VALUE 'admin';
  END IF;
END $$;

UPDATE public.onagui_profiles
SET onagui_type = 'admin'::public.onagui_user_type,
    updated_at = NOW()
WHERE id IN (
  SELECT id
  FROM auth.users
  WHERE LOWER(email) IN (
    'theoonagui@icloud.com',
    'samiraeddaoudi88@gmail.com'
  )
);

UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('is_admin', true),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('is_admin', true)
WHERE LOWER(email) IN (
  'theoonagui@icloud.com',
  'samiraeddaoudi88@gmail.com'
);
