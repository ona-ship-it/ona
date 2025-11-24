-- Safe migration: bind trigger to public.handle_new_user() and set function owner
-- Notes:
-- - This script DOES NOT drop constraints or indexes.
-- - It is idempotent and can be re-run safely.

begin;

-- Ensure the function exists; fail early if missing
do $$
declare
  fn_oid oid;
begin
  select p.oid into fn_oid
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'handle_new_user'
    and p.pronargs = 0; -- handle_new_user()

  if fn_oid is null then
    raise exception 'Function public.handle_new_user() not found. Deploy it before binding the trigger.';
  end if;
end $$;

-- Set function owner to postgres (or your desired owner)
alter function public.handle_new_user() owner to postgres;

-- Rebind the trigger on auth.users to call public.handle_new_user()
do $$
begin
  if exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'auth'
      and c.relname = 'users'
      and t.tgname = 'on_auth_user_created'
  ) then
    drop trigger on_auth_user_created on auth.users;
  end if;

  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
end $$;

commit;

-- Validation helpers (read-only; copy/paste to verify):
-- List trigger and its target function on auth.users
-- select t.tgname,
--        n.nspname as table_schema,
--        c.relname as table_name,
--        p.proname as function_name,
--        pn.nspname as function_schema
-- from pg_trigger t
-- join pg_class c on c.oid = t.tgrelid
-- join pg_namespace n on n.oid = c.relnamespace
-- join pg_proc p on p.oid = t.tgfoid
-- join pg_namespace pn on pn.oid = p.pronamespace
-- where n.nspname = 'auth' and c.relname = 'users' and t.tgname = 'on_auth_user_created';

-- Check function owner
-- select p.proname, pn.nspname as schema, pg_get_userbyid(p.proowner) as owner
-- from pg_proc p
-- join pg_namespace pn on pn.oid = p.pronamespace
-- where pn.nspname = 'public' and p.proname = 'handle_new_user' and p.pronargs = 0;