-- Create table for donations and free claims linked to giveaways
-- Ensures secure inserts by authenticated users and visibility for giveaway creators

begin;

-- Table
create table if not exists public.giveaway_contributions (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references public.giveaways(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('donation','claim')),
  amount numeric(12,2) not null default 0,
  currency text default 'USD',
  note text,
  split_platform numeric null,
  split_creator numeric null,
  split_prize numeric null,
  created_at timestamptz not null default now()
);

comment on table public.giveaway_contributions is 'Records donations and free claims for giveaways.';
comment on column public.giveaway_contributions.kind is 'donation | claim';

-- Indexes
create index if not exists idx_giveaway_contributions_giveaway_id on public.giveaway_contributions (giveaway_id);
create index if not exists idx_giveaway_contributions_user_id on public.giveaway_contributions (user_id);

-- Prevent duplicate free-claims per user per giveaway
create unique index if not exists uq_claim_per_user_per_giveaway
  on public.giveaway_contributions (giveaway_id, user_id)
  where kind = 'claim';

-- Optional split validity: if any split provided, sum must be 1
alter table public.giveaway_contributions
  add constraint contrib_valid_split_sum
  check (
    (split_platform is null and split_creator is null and split_prize is null)
    or round(coalesce(split_platform,0) + coalesce(split_creator,0) + coalesce(split_prize,0), 6) = 1
  );

-- RLS
alter table public.giveaway_contributions enable row level security;

-- Insert policy: authenticated users can insert their own entries to ACTIVE giveaways
create policy contrib_insert_self_active_giveaway
  on public.giveaway_contributions
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.giveaways g
      where g.id = giveaway_id
        and g.status = 'active'
    )
  );

-- Select policy: users can see their own entries
create policy contrib_select_own
  on public.giveaway_contributions
  for select
  to authenticated
  using (user_id = auth.uid());

-- Select policy: creators can view all entries for their giveaways
create policy contrib_select_creator_view
  on public.giveaway_contributions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.giveaways g
      where g.id = giveaway_id
        and g.creator_id = auth.uid()
    )
  );

commit;

-- Verification helpers (safe to run manually)
-- select tab.relname, pol.polname, pol.cmd, pol.roles, pol.qual, pol.with_check
-- from pg_class tab
-- join pg_namespace ns on ns.oid = tab.relnamespace
-- left join pg_policy pol on pol.polrelid = tab.oid
-- where ns.nspname = 'public' and tab.relname = 'giveaway_contributions';

-- select relname, rowsecurity from pg_class where relname = 'giveaway_contributions';

