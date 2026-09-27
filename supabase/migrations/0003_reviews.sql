-- Noir Café — product reviews, moderated before they appear.
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product     text not null,
  guest_name  text not null,
  rating      smallint not null check (rating between 1 and 5),
  body        text not null check (char_length(body) between 10 and 800),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);
create index if not exists reviews_product_approved on public.reviews (product, created_at desc) where status = 'approved';

alter table public.reviews enable row level security;
-- Approved reviews are public; everything else goes through the server.
drop policy if exists "approved reviews are public" on public.reviews;
create policy "approved reviews are public" on public.reviews for select using (status = 'approved');
