-- Enable required extensions
create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- 1. admin_users
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
-- We will add policies later when we implement functions.

-- 2. packages
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null check (price >= 0),
  duration_hours integer not null,
  features text[] not null default '{}',
  is_popular boolean not null default false,
  color_theme text not null, -- e.g., pink, coral, maroon, black
  dp_override integer, -- Override nominal DP just for this package
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.packages enable row level security;
revoke all on public.packages from anon, authenticated;
create policy "Anon can read active packages" on public.packages for select using (is_active = true);

-- 3. addons
create table public.addons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null check (price >= 0),
  unit text, -- e.g., 'per 30 menit', 'per km'
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.addons enable row level security;
revoke all on public.addons from anon, authenticated;
create policy "Anon can read active addons" on public.addons for select using (is_active = true);

-- 4. settings
create table public.settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
revoke all on public.settings from anon, authenticated;
create policy "Anon can read public settings" on public.settings for select using (is_public = true);

-- 5. bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  public_token text unique not null default encode(gen_random_bytes(18), 'hex'),
  customer_name text not null,
  wa_number text not null,
  event_type text not null,
  event_name text,
  package_id uuid not null references public.packages(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  block_start timestamptz not null,
  block_end timestamptz not null,
  venue text not null,
  notes text,
  total_amount integer not null check (total_amount > 0),
  dp_amount integer not null check (dp_amount > 0),
  dp_unique_code integer not null check (dp_unique_code between 1 and 999),
  status text not null default 'menunggu_dp'
    check (status in ('menunggu_dp','dp_diterima','selesai','dibatalkan','kedaluwarsa')),
  hold_expires_at timestamptz,
  tos_agreed_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (end_at > start_at),
  exclude using gist (tstzrange(block_start, block_end) with &&)
    where (status in ('menunggu_dp','dp_diterima'))
);
alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;
-- No policy for anon. Access is strictly via Edge Functions / RPC.

-- 6. booking_addons
create table public.booking_addons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  addon_id uuid not null references public.addons(id),
  quantity integer not null default 1 check (quantity > 0),
  price_at_booking integer not null check (price_at_booking >= 0),
  created_at timestamptz not null default now()
);
alter table public.booking_addons enable row level security;
revoke all on public.booking_addons from anon, authenticated;

-- 7. invoices
create sequence invoice_seq start 1;
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  invoice_number text unique not null,
  status text not null default 'belum_dibayar'
    check (status in ('belum_dibayar', 'dp_diterima', 'lunas', 'dibatalkan')),
  due_date timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.invoices enable row level security;
revoke all on public.invoices from anon, authenticated;

-- 8. payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount integer not null check (amount > 0),
  payment_type text not null check (payment_type in ('dp', 'pelunasan')),
  confirmed_by uuid references auth.users(id),
  confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;

-- 9. blocked_dates
create table public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check (end_at > start_at),
  exclude using gist (tstzrange(start_at, end_at) with &&)
);
alter table public.blocked_dates enable row level security;
revoke all on public.blocked_dates from anon, authenticated;

-- 10. gallery
create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  event_type text not null,
  alt_text text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.gallery enable row level security;
revoke all on public.gallery from anon, authenticated;
create policy "Anon can read active gallery" on public.gallery for select using (is_active = true);

-- 11. testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  event_type text not null,
  content text not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
revoke all on public.testimonials from anon, authenticated;
create policy "Anon can read active testimonials" on public.testimonials for select using (is_active = true);

-- 12. faqs
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
revoke all on public.faqs from anon, authenticated;
create policy "Anon can read active faqs" on public.faqs for select using (is_active = true);

-- 13. customers_flags (for blacklisting)
create table public.customers_flags (
  wa_number text primary key,
  reason text not null,
  created_at timestamptz not null default now()
);
alter table public.customers_flags enable row level security;
revoke all on public.customers_flags from anon, authenticated;

-- 14. rate_limits
create table public.rate_limits (
  ip_hash text not null,
  action text not null,
  hit_count integer not null default 1,
  expires_at timestamptz not null,
  primary key (ip_hash, action)
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- 15. activity_logs
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);
alter table public.activity_logs enable row level security;
revoke all on public.activity_logs from anon, authenticated;

-- Seed Settings
insert into public.settings (key, value, is_public) values
('dp_config', '{"mode": "percent", "value": 30}', true),
('buffer_time', '{"minutes": 60}', false),
('contact_info', '{"wa": "081253776037"}', true),
('hold_duration', '{"hours": 24}', false)
on conflict (key) do nothing;

-- Seed Packages (from PRD)
insert into public.packages (name, price, duration_hours, features, is_popular, color_theme) values
('Paket 2 Jam', 1200000, 2, '{"Unlimited printed photo", "Unlimited file foto", "Video GIF/Boomerang", "Free customized design template", "Scan barcode file photo", "Professional lighting", "Kamera Canon profesional", "Monitor touchscreen", "Free properties", "Crew event"}', false, 'pink'),
('Paket 3 Jam', 1800000, 3, '{"Unlimited printed photo", "Unlimited file foto", "Video GIF/Boomerang", "Free customized design template", "Scan barcode file photo", "Professional lighting", "Kamera Canon profesional", "Monitor touchscreen", "Free properties", "Crew event", "Convex mirror"}', true, 'coral'),
('Paket 4 Jam', 2300000, 4, '{"Unlimited printed photo", "Unlimited file foto", "Video GIF/Boomerang", "Free customized design template", "Scan barcode file photo", "Professional lighting", "Kamera Canon profesional", "Monitor touchscreen", "Free properties", "Crew event", "Convex mirror", "Gantungan kunci", "Free backdrop simple"}', false, 'maroon'),
('Paket 5 Jam', 2800000, 5, '{"Unlimited printed photo", "Unlimited file foto", "Video GIF/Boomerang", "Free customized design template", "Scan barcode file photo", "Professional lighting", "Kamera Canon profesional", "Monitor touchscreen", "Free properties", "Crew event", "Bonus waktu 30 menit", "Convex mirror", "Gantungan kunci", "Album foto", "Free backdrop simple"}', false, 'black');
