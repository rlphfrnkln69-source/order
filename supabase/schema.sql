-- ============================================================
-- GroupOrder — Supabase schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- SESSIONS ----------
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  session_code text unique not null,        -- short shareable code, e.g. "ABC123"
  session_name text not null,
  restaurant_name text,
  notes text,
  status text not null default 'open' check (status in ('open', 'closed')),
  organizer_token text not null,            -- secret held only by the creator's browser
  created_at timestamptz not null default now()
);

-- ---------- ORDERS ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  client_token text not null,               -- identifies the browser that added this order
  name text not null,
  order_name text not null,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0),
  total numeric(10, 2) generated always as (quantity * price) stored,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_session_id_idx on orders (session_id);
create index if not exists sessions_session_code_idx on sessions (session_code);

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- No user accounts, so access is intentionally open at the DB
-- level (anyone with the anon key can read/write). Ownership
-- (organizer vs. regular user) is enforced in the app UI via
-- organizer_token / client_token, not by Postgres. Good enough
-- for a small trusted friend group — do not use this schema
-- for anything sensitive.
-- ============================================================

alter table sessions enable row level security;
alter table orders enable row level security;

create policy "sessions are publicly readable"
  on sessions for select using (true);

create policy "anyone can create a session"
  on sessions for insert with check (true);

create policy "anyone can update a session"
  on sessions for update using (true);

create policy "orders are publicly readable"
  on orders for select using (true);

create policy "anyone can add an order"
  on orders for insert with check (true);

create policy "anyone can update an order"
  on orders for update using (true);

create policy "anyone can delete an order"
  on orders for delete using (true);

-- ============================================================
-- Realtime: let the frontend subscribe to live order changes
-- ============================================================
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table sessions;
