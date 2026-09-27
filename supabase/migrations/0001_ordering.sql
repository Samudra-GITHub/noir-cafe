-- Noir Café — ordering schema (Supabase / Postgres).
-- The site talks to these tables only from the server, with the service-role
-- key (src/server/supabase.ts); row-level security stays on so the public
-- anon key can read nothing but live availability.

-- Live availability: a row per menu item slug (see src/data/ordering.ts slugOf).
create table if not exists public.menu_availability (
  slug        text primary key,
  available   boolean not null default true,
  note        text,
  updated_at  timestamptz not null default now()
);

-- Orders placed on /order. Prices are recomputed by the server before insert.
create table if not exists public.orders (
  id              uuid primary key,
  number          text not null unique,
  user_id         text,                        -- Clerk user id, null for guests
  cafe_id         text not null check (cafe_id in ('mercer', 'wythe', 'west-10th')),
  guest_name      text not null,
  pickup_at       timestamptz not null,
  status          text not null check (status in ('received', 'awaiting_payment', 'paid', 'preparing', 'ready', 'collected', 'cancelled')),
  payment         text not null check (payment in ('pickup', 'card')),
  lines           jsonb not null,
  subtotal_cents  integer not null check (subtotal_cents >= 0),
  created_at      timestamptz not null default now()
);
create index if not exists orders_cafe_pickup on public.orders (cafe_id, pickup_at);
create index if not exists orders_user on public.orders (user_id) where user_id is not null;

-- Favourite drinks, synced for signed-in guests.
create table if not exists public.favorites (
  user_id    text not null,
  slug       text not null,
  modifiers  jsonb not null default '{}'::jsonb,
  position   integer not null default 0,
  primary key (user_id, slug, modifiers)
);

alter table public.menu_availability enable row level security;
alter table public.orders enable row level security;
alter table public.favorites enable row level security;

-- Anyone may read availability (e.g. a bar display using the anon key).
drop policy if exists "availability is public" on public.menu_availability;
create policy "availability is public" on public.menu_availability for select using (true);

-- Orders and favourites: no anon policies — only the server (service role) reads and writes them.

-- Realtime for the bar's order screen and availability changes.
alter publication supabase_realtime add table public.orders, public.menu_availability;

-- Seed availability for every item on the autumn menu (all available).
insert into public.menu_availability (slug) values
  ('espresso'), ('americano'), ('classic-latte'), ('black-sesame'), ('noir-cappuccino'), ('cacao-cap'),
  ('ceremonial-matcha'), ('matcha-cloud'), ('jasmine-silver-needle'), ('smoked-earl-grey'),
  ('cardamom-bun'), ('chocolate-rye-cookie')
on conflict (slug) do nothing;
