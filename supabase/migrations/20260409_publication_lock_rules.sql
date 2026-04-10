-- Publication lock rules
-- Blocks prize changes and deletion/cancel after entries/ticket sales exist.

-- Giveaways
create or replace function public.enforce_giveaway_lock_after_entries()
returns trigger
language plpgsql
as $$
declare
  has_entries boolean;
  oldj jsonb;
  newj jsonb;
begin
  oldj := to_jsonb(old);
  if tg_op = 'UPDATE' then
    newj := to_jsonb(new);
  end if;

  select
    exists (
      select 1
      from public.tickets t
      where t.giveaway_id = old.id
      limit 1
    )
    or coalesce((oldj ->> 'tickets_sold')::int, 0) > 0
  into has_entries;

  if tg_op = 'DELETE' then
    if has_entries then
      raise exception 'Cannot delete giveaway after entries exist';
    end if;
    return old;
  end if;

  if has_entries then
    if
      (oldj ->> 'prize_value') is distinct from (newj ->> 'prize_value')
      or (oldj ->> 'prize_amount') is distinct from (newj ->> 'prize_amount')
      or (oldj ->> 'prize_currency') is distinct from (newj ->> 'prize_currency')
      or (oldj ->> 'prize_pool_usdt') is distinct from (newj ->> 'prize_pool_usdt')
    then
      raise exception 'Cannot modify giveaway prize after entries exist';
    end if;

    if (oldj ? 'is_deleted') and (newj ? 'is_deleted') then
      if coalesce((oldj ->> 'is_deleted')::boolean, false) = false
         and coalesce((newj ->> 'is_deleted')::boolean, false) = true
      then
        raise exception 'Cannot delete giveaway after entries exist';
      end if;
    end if;

    if (oldj ? 'status') and (newj ? 'status') then
      if lower(coalesce(newj ->> 'status', '')) in ('deleted', 'cancelled')
         and (newj ->> 'status') is distinct from (oldj ->> 'status')
      then
        raise exception 'Cannot delete/cancel giveaway after entries exist';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_giveaway_lock_after_entries_u on public.giveaways;
create trigger trg_enforce_giveaway_lock_after_entries_u
before update on public.giveaways
for each row execute function public.enforce_giveaway_lock_after_entries();

drop trigger if exists trg_enforce_giveaway_lock_after_entries_d on public.giveaways;
create trigger trg_enforce_giveaway_lock_after_entries_d
before delete on public.giveaways
for each row execute function public.enforce_giveaway_lock_after_entries();

-- Raffles
create or replace function public.enforce_raffle_lock_after_sales()
returns trigger
language plpgsql
as $$
declare
  has_sales boolean;
  oldj jsonb;
  newj jsonb;
begin
  oldj := to_jsonb(old);
  if tg_op = 'UPDATE' then
    newj := to_jsonb(new);
  end if;

  select
    exists (
      select 1
      from public.raffle_tickets rt
      where rt.raffle_id = old.id
      limit 1
    )
    or coalesce((oldj ->> 'tickets_sold')::int, 0) > 0
  into has_sales;

  if tg_op = 'DELETE' then
    if has_sales then
      raise exception 'Cannot delete raffle after ticket sales exist';
    end if;
    return old;
  end if;

  if has_sales then
    if
      (oldj ->> 'prize_value') is distinct from (newj ->> 'prize_value')
      or (oldj ->> 'prize_currency') is distinct from (newj ->> 'prize_currency')
    then
      raise exception 'Cannot modify raffle prize after ticket sales exist';
    end if;

    if (oldj ? 'status') and (newj ? 'status') then
      if lower(coalesce(newj ->> 'status', '')) in ('deleted', 'cancelled')
         and (newj ->> 'status') is distinct from (oldj ->> 'status')
      then
        raise exception 'Cannot delete/cancel raffle after ticket sales exist';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_raffle_lock_after_sales_u on public.raffles;
create trigger trg_enforce_raffle_lock_after_sales_u
before update on public.raffles
for each row execute function public.enforce_raffle_lock_after_sales();

drop trigger if exists trg_enforce_raffle_lock_after_sales_d on public.raffles;
create trigger trg_enforce_raffle_lock_after_sales_d
before delete on public.raffles
for each row execute function public.enforce_raffle_lock_after_sales();
