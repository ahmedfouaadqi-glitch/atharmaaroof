create extension if not exists pgcrypto;

create table if not exists public.athar_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  public_code text not null unique default ('ATH-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8))),
  kind text not null check (kind in ('lost', 'found')),
  category text not null check (char_length(category) between 2 and 80),
  title text not null check (char_length(title) between 3 and 120),
  city text not null check (city in ('بغداد', 'كربلاء', 'النجف', 'البصرة', 'سامراء')),
  area text null check (area is null or char_length(area) <= 100),
  details text null check (details is null or char_length(details) <= 500),
  status text not null default 'pending' check (status in ('pending', 'published', 'matched', 'returned', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athar_reports_public_lookup_idx
  on public.athar_reports (status, city, kind, created_at desc);

alter table public.athar_reports enable row level security;

revoke all on public.athar_reports from anon, authenticated;
grant select (id, public_code, kind, category, title, city, area, details, status, created_at)
  on public.athar_reports to anon, authenticated;
grant insert (owner_id, kind, category, title, city, area, details)
  on public.athar_reports to authenticated;
grant update (kind, category, title, city, area, details)
  on public.athar_reports to authenticated;

create policy "Published reports are publicly readable"
  on public.athar_reports for select to anon, authenticated
  using (status = 'published');

create policy "Owners can read their own reports"
  on public.athar_reports for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can create their own reports"
  on public.athar_reports for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their own reports"
  on public.athar_reports for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create or replace view public.athar_public_reports
with (security_invoker = true)
as
select
  id,
  public_code,
  kind,
  category,
  title,
  city,
  area,
  details,
  status,
  created_at
from public.athar_reports
where status = 'published';

grant select on public.athar_public_reports to anon, authenticated;
grant usage on schema public to anon, authenticated;

comment on table public.athar_reports is
  'Private owner-bound lost-and-found reports. Never store national ID numbers, payment card data, OTPs, or exact GPS coordinates.';
comment on view public.athar_public_reports is
  'Public-safe report fields only; excludes owner_id and contact information.';
