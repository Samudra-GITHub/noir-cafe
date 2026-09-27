-- Noir Café — Web Push subscriptions (server-only access).
create table if not exists public.push_subscriptions (
  endpoint    text primary key,
  keys        jsonb not null,
  created_at  timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
-- No anon policies: subscriptions are written and read by the server only.
