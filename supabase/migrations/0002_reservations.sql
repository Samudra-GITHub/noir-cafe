-- Noir Café — reservations (Supabase / Postgres).

-- Covers per seating area (overrides the defaults in src/data/reservation.ts).
create table if not exists public.reservation_capacity (
  seating  text primary key check (seating in ('window', 'indoor', 'outdoor')),
  covers   integer not null check (covers >= 0)
);
insert into public.reservation_capacity (seating, covers) values ('window', 8), ('indoor', 16), ('outdoor', 10)
on conflict (seating) do nothing;

create table if not exists public.reservations (
  code        text primary key,
  day         date not null,
  time        text not null check (time in ('09:30', '10:00', '10:30', '11:00')),
  seating     text not null references public.reservation_capacity (seating),
  covers      integer not null check (covers between 1 and 12),
  guests      text not null,
  guest_name  text not null,
  email       text not null,
  status      text not null default 'booked' check (status in ('booked', 'seated', 'cancelled', 'no_show')),
  created_at  timestamptz not null default now()
);
create index if not exists reservations_slot on public.reservations (day, time, seating) where status <> 'cancelled';

alter table public.reservation_capacity enable row level security;
alter table public.reservations enable row level security;
-- No anon policies: the site reads and writes through the server (service role).

-- Book a table atomically: lock the area's capacity row, count what's taken
-- for that day and time, and insert only if the party still fits.
create or replace function public.book_table(
  p_code text, p_day date, p_time text, p_seating text, p_covers integer,
  p_guests text, p_name text, p_email text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  cap integer;
  taken integer;
begin
  select covers into cap from reservation_capacity where seating = p_seating for update;
  if cap is null then return false; end if;
  select coalesce(sum(covers), 0) into taken
    from reservations
    where day = p_day and time = p_time and seating = p_seating and status <> 'cancelled';
  if taken + p_covers > cap then return false; end if;
  insert into reservations (code, day, time, seating, covers, guests, guest_name, email)
    values (p_code, p_day, p_time, p_seating, p_covers, p_guests, p_name, p_email);
  return true;
end;
$$;
revoke all on function public.book_table from public, anon, authenticated;

alter publication supabase_realtime add table public.reservations;
