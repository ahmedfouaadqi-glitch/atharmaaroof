-- Optional approximate report coordinates and public nearby-search RPC.
-- User device coordinates are only used for the query and are never stored by this function.

begin;

alter table public.athar_reports
  add column if not exists location_lat numeric(5,2),
  add column if not exists location_lng numeric(6,2);

alter table public.athar_reports
  add constraint athar_reports_location_pair_check
  check (
    (location_lat is null and location_lng is null)
    or (
      location_lat between -90 and 90
      and location_lng between -180 and 180
    )
  );

create index if not exists athar_reports_nearby_idx
  on public.athar_reports (status, location_lat, location_lng)
  where location_lat is not null and location_lng is not null;

-- Existing INSERT column grants are explicit; add only these optional fields.
grant insert (location_lat, location_lng)
  on public.athar_reports to authenticated;

create or replace function public.athar_find_nearby_reports(
  p_lat double precision,
  p_lng double precision,
  p_radius_m integer default 5000,
  p_limit integer default 20
)
returns table (
  id uuid,
  public_code text,
  kind text,
  category text,
  title text,
  city text,
  area text,
  status text,
  created_at timestamptz,
  approx_distance_km integer
)
language sql
stable
security definer
set search_path = ''
as $function$
  with input as (
    select
      p_lat as lat,
      p_lng as lng,
      least(greatest(coalesce(p_radius_m, 5000), 500), 25000)::double precision as radius_m,
      least(greatest(coalesce(p_limit, 20), 1), 30)::integer as result_limit
    where p_lat between -90 and 90
      and p_lng between -180 and 180
      and coalesce(p_radius_m, 5000) between 500 and 25000
  ),
  candidates as (
    select
      r.id,
      r.public_code,
      r.kind,
      r.category,
      r.title,
      r.city,
      r.area,
      r.status,
      r.created_at,
      6371000.0 * 2.0 * asin(sqrt(least(1.0, greatest(0.0,
        power(sin(radians((r.location_lat::double precision - i.lat) / 2.0)), 2)
        + cos(radians(i.lat))
        * cos(radians(r.location_lat::double precision))
        * power(sin(radians((r.location_lng::double precision - i.lng) / 2.0)), 2)
      )))) as distance_m,
      i.radius_m,
      i.result_limit
    from public.athar_reports r
    cross join input i
    where r.status = 'published'
      and r.location_lat is not null
      and r.location_lng is not null
      and r.location_lat between i.lat - (i.radius_m / 110000.0)
                            and i.lat + (i.radius_m / 110000.0)
      and r.location_lng between i.lng - (i.radius_m / (110000.0 * greatest(abs(cos(radians(i.lat))), 0.05)))
                            and i.lng + (i.radius_m / (110000.0 * greatest(abs(cos(radians(i.lat))), 0.05)))
  )
  select
    c.id,
    c.public_code,
    c.kind,
    c.category,
    c.title,
    c.city,
    c.area,
    c.status,
    c.created_at,
    round(c.distance_m / 1000.0)::integer as approx_distance_km
  from candidates c
  where c.distance_m <= c.radius_m
  order by c.distance_m asc, c.created_at desc
  limit (select result_limit from input);
$function$;

-- SECURITY DEFINER is necessary because coordinates must not be directly selectable.
-- The RPC returns only public report fields and an approximate integer distance;
-- it never returns stored coordinates or private owner IDs.
revoke all on function public.athar_find_nearby_reports(double precision, double precision, integer, integer)
  from public, anon, authenticated;
grant execute on function public.athar_find_nearby_reports(double precision, double precision, integer, integer)
  to anon, authenticated;

comment on column public.athar_reports.location_lat is
  'Optional rounded latitude (2 decimals) for local matching. Never returned in public views.';
comment on column public.athar_reports.location_lng is
  'Optional rounded longitude (2 decimals) for local matching. Never returned in public.';
comment on function public.athar_find_nearby_reports(double precision, double precision, integer, integer) is
  'Returns published, geotagged reports within a bounded radius; reveals rounded distance only and no coordinates.';

commit;
