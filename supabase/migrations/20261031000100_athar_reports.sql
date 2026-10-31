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

create table if not exists public.athar_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.athar_admins enable row level security;
revoke all on public.athar_admins from anon, authenticated;
grant select on public.athar_admins to authenticated;

create policy "Admins can verify their own role"
  on public.athar_admins for select to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.athar_report_status_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.athar_reports(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete restrict,
  previous_status text not null check (previous_status in ('pending', 'published', 'matched', 'returned', 'hidden')),
  new_status text not null check (new_status in ('pending', 'published', 'matched', 'returned', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists athar_report_status_events_report_idx
  on public.athar_report_status_events (report_id, created_at desc);

alter table public.athar_report_status_events enable row level security;
revoke all on public.athar_report_status_events from anon, authenticated;
grant select on public.athar_report_status_events to authenticated;

create policy "Admins can read moderation history"
  on public.athar_report_status_events for select to authenticated
  using (exists (
    select 1 from public.athar_admins a
    where a.user_id = (select auth.uid())
  ));

alter table public.athar_reports enable row level security;

revoke all on public.athar_reports from anon, authenticated;
grant select (id, public_code, kind, category, title, city, area, details, status, created_at, updated_at)
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

create policy "Owners can update their own pending reports"
  on public.athar_reports for update to authenticated
  using ((select auth.uid()) = owner_id and status = 'pending')
  with check ((select auth.uid()) = owner_id and status = 'pending');

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

create policy "Admins can read all reports"
  on public.athar_reports for select to authenticated
  using (exists (
    select 1 from public.athar_admins a
    where a.user_id = (select auth.uid())
  ));


create policy "Admins can moderate report status"
  on public.athar_reports for update to authenticated
  using (exists (
    select 1 from public.athar_admins a
    where a.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.athar_admins a
    where a.user_id = (select auth.uid())
  ));

create or replace function public.athar_admin_set_report_status(
  p_report_id uuid,
  p_new_status text
)
returns table (id uuid, public_code text, status text, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $
declare
  v_previous_status text;
begin
  if auth.uid() is null or not exists (
    select 1
    from public.athar_admins a
    where a.user_id = auth.uid()
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_new_status not in ('pending', 'published', 'matched', 'returned', 'hidden') then
    raise exception 'invalid status' using errcode = '22023';
  end if;

  select r.status into v_previous_status
  from public.athar_reports r
  where r.id = p_report_id
  for update;

  if not found then
    return;
  end if;

  update public.athar_reports r
  set status = p_new_status, updated_at = now()
  where r.id = p_report_id
  returning r.id, r.public_code, r.status, r.updated_at
  into id, public_code, status, updated_at;

  insert into public.athar_report_status_events
    (report_id, actor_id, previous_status, new_status)
  values
    (p_report_id, auth.uid(), v_previous_status, p_new_status);

  return next;
end;
$;

revoke all on function public.athar_admin_set_report_status(uuid, text) from public, anon;
grant execute on function public.athar_admin_set_report_status(uuid, text) to authenticated;
