-- Purpose: Remove duplicate unique index on public.onagui_profiles.username.
-- Keeps:   public.onagui_profiles_username_key
-- Drops:   public.onagui_profiles_username_unique (only if truly duplicate)
-- Safety:  Idempotent; only drops when both indexes exist and definitions match.
-- Note:    Uses non-concurrent DROP to keep logic within a transaction block.

do $$
declare
  idx_key_oid    oid;
  idx_unique_oid oid;
  def_key        text;
  def_unique     text;
begin
  -- Fetch index OIDs and definitions
  select i.indexrelid, pg_get_indexdef(i.indexrelid)
    into idx_key_oid, def_key
  from pg_index i
  where i.indexrelid::regclass::text = 'onagui_profiles_username_key';

  select i.indexrelid, pg_get_indexdef(i.indexrelid)
    into idx_unique_oid, def_unique
  from pg_index i
  where i.indexrelid::regclass::text = 'onagui_profiles_username_unique';

  -- If duplicate index already gone, nothing to do
  if idx_unique_oid is null then
    raise notice 'Index % not found; nothing to drop', 'public.onagui_profiles_username_unique';
    return;
  end if;

  -- If the keeper index is missing, do not drop to avoid removing uniqueness
  if idx_key_oid is null then
    raise notice 'Keeper index % missing; not dropping %',
                 'public.onagui_profiles_username_key', 'public.onagui_profiles_username_unique';
    return;
  end if;

  -- Only drop when definitions are identical (same columns/expressions/method)
  if def_key = def_unique then
    execute 'drop index if exists public.onagui_profiles_username_unique';
    raise notice 'Dropped duplicate index %', 'public.onagui_profiles_username_unique';
  else
    raise notice 'Indexes differ; not dropping. key=%, unique=%', def_key, def_unique;
  end if;
end $$;

-- Optional: quick verification
-- select schemaname, tablename, indexname, indexdef
-- from pg_indexes
-- where schemaname = 'public' and tablename = 'onagui_profiles'
--   and indexname like 'onagui_profiles_username%'
-- order by indexname;