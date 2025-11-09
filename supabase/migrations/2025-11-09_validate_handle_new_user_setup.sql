-- Validation queries for handle_new_user trigger and username uniqueness
-- Run these in Supabase SQL editor after applying the migration

-- Confirm trigger binding on auth.users
SELECT t.tgname AS trigger_name,
       n.nspname AS table_schema,
       c.relname AS table_name,
       p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal;

-- Inspect indexes on public.onagui_profiles
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'onagui_profiles'
ORDER BY indexname;

-- Verify unique constraint exists on username
SELECT c.conname, c.contype
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public' AND t.relname = 'onagui_profiles' AND c.contype = 'u';

-- Confirm function owner (should be postgres or your elevated migration role)
SELECT n.nspname AS schema, p.proname AS function_name, r.rolname AS owner
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_roles r ON r.oid = p.proowner
WHERE n.nspname = 'public' AND p.proname = 'handle_new_user';

-- Quick manual check: show latest profiles created
SELECT id, email, username, onagui_type, created_at
FROM public.onagui_profiles
ORDER BY created_at DESC
LIMIT 10;