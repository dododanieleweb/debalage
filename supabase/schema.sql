-- ============================================================
--  VintageHub – Supabase Schema
--  Run once in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ============================================================
--  PROFILES  (mirrors auth.users)
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  name         text        not null,
  email        text        not null,
  city         text        not null default '',
  role         text        not null default 'buyer'   check (role in ('buyer','seller','both','admin')),
  avatar       text        not null default '',
  bio          text        not null default '',
  specialties  text[]      not null default '{}',
  verified     boolean     not null default false,
  rating       numeric(3,1)not null default 0,
  review_count int         not null default 0,
  sales_count  int         not null default 0,
  joined_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read all"
  on public.profiles for select using (true);

create policy "profiles: insert own"
  on public.profiles for insert with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, city, role, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    'https://ui-avatars.com/api/?name=' ||
      replace(coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),' ','+') ||
      '&background=8B6B4E&color=FFF9F0&size=128'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
--  EVENTS
-- ============================================================
create table if not exists public.events (
  id               text primary key,
  seller_id        uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  description      text not null default '',
  type             text not null check (type in ('casa_privata','mercatino','mostra','pop_up')),
  status           text not null default 'upcoming' check (status in ('upcoming','ongoing','completed')),
  date             text not null,
  end_date         text,
  time_start       text not null default '',
  time_end         text not null default '',
  city             text not null default '',
  address          text not null default '',
  image            text not null default '',
  products_count   int  not null default 0,
  max_attendees    int,
  current_attendees int  not null default 0,
  featured         boolean not null default false,
  slot_duration    int,
  slot_max_capacity int,
  created_at       timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events: read all"          on public.events for select using (true);
create policy "events: insert own"        on public.events for insert with check (auth.uid() = seller_id);
create policy "events: update own"        on public.events for update using (auth.uid() = seller_id);
create policy "events: delete own"        on public.events for delete using (auth.uid() = seller_id);

-- ============================================================
--  PRODUCTS
-- ============================================================
create table if not exists public.products (
  id             text primary key,
  seller_id      uuid not null references public.profiles(id) on delete cascade,
  event_id       text references public.events(id) on delete set null,
  title          text not null,
  description    text not null default '',
  category       text not null default '',
  subcategory    text,
  condition      text not null default 'buono' check (condition in ('come_nuovo','ottimo','buono','discreto')),
  era            text,
  brand          text,
  material       text,
  dimensions     text,
  images         text[] not null default '{}',
  tags           text[] not null default '{}',
  price          numeric(10,2) not null,
  original_price numeric(10,2),
  status         text not null default 'available' check (status in ('available','reserved','sold')),
  featured       boolean not null default false,
  views          int not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products: read all"    on public.products for select using (true);
create policy "products: insert own"  on public.products for insert with check (auth.uid() = seller_id);
create policy "products: update own"  on public.products for update using (auth.uid() = seller_id);
create policy "products: delete own"  on public.products for delete using (auth.uid() = seller_id);

-- ============================================================
--  TIME SLOTS  (for casa_privata events)
-- ============================================================
create table if not exists public.time_slots (
  id           text primary key,
  event_id     text not null references public.events(id) on delete cascade,
  start_time   text not null,
  end_time     text not null,
  max_capacity int  not null default 4,
  booked       int  not null default 0,
  disabled     boolean not null default false
);

alter table public.time_slots enable row level security;

create policy "time_slots: read all"   on public.time_slots for select using (true);
create policy "time_slots: insert own" on public.time_slots for insert
  with check (auth.uid() = (select seller_id from public.events where id = event_id));
create policy "time_slots: update own" on public.time_slots for update
  using (auth.uid() = (select seller_id from public.events where id = event_id));
create policy "time_slots: delete own" on public.time_slots for delete
  using (auth.uid() = (select seller_id from public.events where id = event_id));

-- ============================================================
--  BOOKINGS  (slot reservations by buyers)
-- ============================================================
create table if not exists public.bookings (
  id         text primary key,
  slot_id    text not null references public.time_slots(id) on delete cascade,
  event_id   text not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  created_at timestamptz not null default now(),
  unique (slot_id, user_id)
);

alter table public.bookings enable row level security;

create policy "bookings: read own or seller"
  on public.bookings for select using (
    auth.uid() = user_id or
    auth.uid() = (select seller_id from public.events where id = event_id)
  );
create policy "bookings: insert own"
  on public.bookings for insert with check (auth.uid() = user_id);
create policy "bookings: update own"
  on public.bookings for update using (auth.uid() = user_id);

-- ============================================================
--  ORDERS
-- ============================================================
create table if not exists public.orders (
  id              text primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  status          text not null default 'confermato'
                    check (status in ('confermato','spedito','consegnato','annullato')),
  total           numeric(10,2) not null,
  subtotal        numeric(10,2) not null default 0,
  shipping        numeric(10,2) not null default 0,
  address         text not null default '',
  city            text not null default '',
  created_at      timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders: read own"   on public.orders for select using (auth.uid() = user_id);
create policy "orders: insert own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders: update own" on public.orders for update using (auth.uid() = user_id);

-- ============================================================
--  ORDER ITEMS
-- ============================================================
create table if not exists public.order_items (
  id          text primary key,
  order_id    text not null references public.orders(id) on delete cascade,
  product_id  text not null,
  title       text not null,
  price       numeric(10,2) not null,
  image       text not null default '',
  seller_id   uuid references public.profiles(id) on delete set null,
  seller_name text not null default ''
);

alter table public.order_items enable row level security;

create policy "order_items: read own"
  on public.order_items for select
  using (auth.uid() = (select user_id from public.orders where id = order_id));
create policy "order_items: insert own"
  on public.order_items for insert
  with check (auth.uid() = (select user_id from public.orders where id = order_id));

-- ============================================================
--  WISHLISTS
-- ============================================================
create table if not exists public.wishlists (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id text not null,
  primary key (user_id, product_id)
);

alter table public.wishlists enable row level security;

create policy "wishlists: manage own"
  on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
--  APP SETTINGS  (key-value store for platform configuration)
-- ============================================================
create table if not exists public.app_settings (
  key        text primary key,
  value      text        not null default '',
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Everyone can read settings (e.g. to show the event fee to sellers)
create policy "app_settings: read all"
  on public.app_settings for select using (true);

-- Only admins can insert/update settings
create policy "app_settings: admin insert"
  on public.app_settings for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "app_settings: admin update"
  on public.app_settings for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed default values (run idempotently)
insert into public.app_settings (key, value)
  values ('event_fee', '0')
  on conflict (key) do nothing;
