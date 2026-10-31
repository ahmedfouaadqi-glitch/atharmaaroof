-- ATHAR permission hardening.
-- Explicit grants and RLS work together: grants expose only required objects;
-- policies restrict which rows authenticated and anonymous roles can access.

begin;

grant usage on schema public to anon, authenticated;

alter table public.athar_reports enable row level security;
alter table public.athar_admins enable row level security;
alter table public.athar_report_status_events enable row level security;

revoke all privileges on table public.athar_reports from public, anon, authenticated;
revoke all privileges on table public.athar_admins from public, anon, authenticated;
revoke all privileges on table public.athar_report_status_events from public, anon, authenticated;
revoke all privileges on table public.athar_public_reports from public, anon, authenticated;

-- Public users can read only safe columns, and RLS further restricts this to published rows.
grant select (id, public_code, kind, category, title, city, area, details, status, created_at, updated_at)
  on table public.athar_reports to anon, authenticated;

-- Authenticated users can create their own reports and edit only non-moderation fields.
grant insert (owner_id, kind, category, title, city, area, details)
  on table public.athar_reports to authenticated;
grant update (kind, category, title, city, area, details)
  on table public.athar_reports to authenticated;

-- Role membership and moderation history are never available to anonymous clients.
grant select on table public.athar_admins to authenticated;
grant select on table public.athar_report_status_events to authenticated;

-- The security-invoker view exposes published reports only; the underlying RLS policy still applies.
grant select on table public.athar_public_reports to anon, authenticated;

-- Only authenticated callers may invoke the moderation RPC; its function body verifies
-- auth.uid() against athar_admins before making any status change.
revoke all privileges on function public.athar_admin_set_report_status(uuid, text) from public, anon;
grant execute on function public.athar_admin_set_report_status(uuid, text) to authenticated;

-- Future public-schema objects are opt-in. Add table/function grants explicitly in
-- the migration that creates each object, together with its RLS policy.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;

commit;
