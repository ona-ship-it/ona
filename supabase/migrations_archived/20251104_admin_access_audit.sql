-- Create admin access audit table
create table if not exists admin_access_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  action text not null,
  page text not null,
  note text null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table admin_access_audit enable row level security;

-- Allow authenticated users to insert their own audit entries
create policy admin_access_audit_insert on admin_access_audit
  for insert to authenticated
  with check (auth.uid() is not null);

-- Allow select for admins only (optional; depends on existing is_admin_user RPC)
do $$
begin
  -- If the function exists, add a policy using it
  if exists (
    select 1 from pg_proc where proname = 'is_admin_user'
  ) then
    create policy admin_access_audit_select on admin_access_audit
      for select to authenticated
      using (
        (select coalesce((select is_admin_user(auth.uid())), false))
      );
  end if;
exception when others then
  -- Ignore errors if function not present
  null;
end $$;

-- Helpful indexes for filtering
create index if not exists idx_admin_access_audit_created_at on admin_access_audit(created_at desc);
create index if not exists idx_admin_access_audit_user on admin_access_audit(user_id);
create index if not exists idx_admin_access_audit_action on admin_access_audit(action);
create index if not exists idx_admin_access_audit_page on admin_access_audit(page);