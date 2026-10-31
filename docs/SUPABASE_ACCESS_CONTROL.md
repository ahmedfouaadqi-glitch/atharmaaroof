# أثر معروف — Supabase roles and access control

## Required project connection

The production app expects these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The public key is designed to be present in the browser. Never use a `service_role` or secret key as a `NEXT_PUBLIC_*` variable, and never commit either secret to Git.

The current Vercel project was inspected and had no environment variables configured. The Supabase connector currently exposes a different project than ATHAR's configured project reference, so project-level SQL and live role verification could not be performed from this session. Connect the correct Supabase project before applying migrations or setting Vercel credentials.

## Database migrations

Apply the migrations in order:

1. `20261031000100_athar_reports.sql`
2. `20261101000100_athar_security_hardening.sql`
3. `20261101000200_athar_nearby_reports.sql`

The second migration repeats the minimum object grants explicitly and revokes broad default privileges for newly created objects in `public`. The third adds coarse report coordinates and a restricted nearby-search RPC; it returns approximate distance only and never returns coordinates. Run migrations in order after the initial ATHAR schema exists.

Supabase's Data API requires both PostgreSQL grants and RLS policies. A grant alone does not authorize rows; RLS alone does not expose a table to the Data API. The `athar_public_reports` view uses `security_invoker = true` so the caller's privileges and RLS policies apply.

## Roles

ATHAR currently uses two application access levels:

| Role | Authentication | Database permissions |
|---|---|---|
| Visitor | None | Read published, public-safe reports only |
| Anonymous guest | Supabase anonymous Auth session | Create and own reports using an Auth UUID without entering email/password; same owner-bound RLS as other users |
| Signed-in user | Supabase Auth | Create reports owned by their user ID; read own reports; edit only their own pending report fields |
| Administrator | Supabase Auth + explicit row in `athar_admins` | Read all reports, read moderation history, and change moderation status through the guarded RPC |

There is no client-side admin flag. Authorization requires all three checks: the server-side `ATHAR_ADMIN_EMAILS` allowlist, a valid Supabase Auth session, and a matching row in `athar_admins`. The user-editable `user_metadata` is never used to assign roles. The dedicated admin URL is `/control-center`; the legacy `/admin/login` route redirects there. Set `ATHAR_ADMIN_EMAILS=ahmedmaaroof814@gmail.com` in Vercel (server-side only). The administrator password remains a Supabase Auth credential and must not be hard-coded in the repository or browser.

## Bootstrap the first administrator

1. Create the intended administrator account through the regular user sign-up at `/login`.
2. Confirm that the account exists in Supabase Auth.
3. From the SQL Editor, run the following query after replacing the email with the verified account email:

```sql
insert into public.athar_admins (user_id)
select id
from auth.users
where lower(email) = lower('ahmedmaaroof814@gmail.com')
on conflict (user_id) do nothing;
```

4. Add the email to the `ATHAR_ADMIN_EMAILS` environment variable in Vercel.
5. Sign in at `/control-center` using the administrator's Supabase Auth credentials. The server checks the email allowlist and `athar_admins` membership before allowing access to `/admin/reports`. The fixed passcode shared in chat is not embedded in source code; rotate any password that has been shared in a chat.

To revoke a specific administrator, remove only that verified account's membership row:

```sql
delete from public.athar_admins
where user_id = (
  select id from auth.users
  where lower(email) = lower('ahmedmaaroof814@gmail.com')
);
```

## Verification SQL

After applying both migrations, verify RLS is enabled:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('athar_reports', 'athar_admins', 'athar_report_status_events')
order by tablename;
```

Verify the grants:

```sql
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('athar_reports', 'athar_admins', 'athar_report_status_events', 'athar_public_reports')
order by table_name, grantee, privilege_type;
```

Verify the moderation function is not executable by `anon` or `PUBLIC`:

```sql
select
  p.proname,
  p.prosecdef as security_definer,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'athar_admin_set_report_status';
```

Expected: RLS is enabled on all three tables; the RPC is not executable by `anon`, and is executable by `authenticated` because the function body independently checks the administrator table.

## Anonymous guest identity

Enable **Authentication → Providers → Anonymous Sign-Ins** and **manual identity linking** in the intended Supabase project. The app creates an anonymous Auth user when a visitor first opens the report form; the report's `owner_id` is the Supabase Auth UUID and is protected by owner RLS. Anonymous users are not identified by IP or MAC address. Supabase documents that an anonymous Auth user loses account access if browser data is cleared or another browser/device is used. The report form offers email recovery: the visitor adds an email to the current anonymous user, confirms that email, and can later recover the same account using the email magic-link button on `/login`; this preserves the original Auth UUID and report ownership. Anonymous sign-ins can be abused; enable CAPTCHA/Turnstile and review Supabase Auth rate limits before a public launch.

## Nearby search

The third migration stores only optional report coordinates rounded to two decimal places (roughly kilometre-level). Browser location is requested only after an explicit button press. Search coordinates are used for one RPC call and are not persisted; the RPC returns public-safe report fields plus a rounded distance band, never the stored coordinates. Reports without an opted-in approximate location cannot appear in the nearby results.

## Application routes

- `/login`: regular user login and registration (optional for browsing and guest reports).
- `/control-center`: isolated administrator sign-in; no registration flow. The email must be in `ATHAR_ADMIN_EMAILS` and in `athar_admins`.
- `/admin/reports`: server-side guarded page. Its API endpoints independently verify the session, allowlisted email and administrator membership on every request.
- `/privacy`, `/terms`, `/faq`, `/about`: public privacy, terms, FAQ and initiative information.

A 403 from admin APIs means that the account is signed in but is not in `athar_admins`. A 503 indicates configuration or database access is incomplete; it must not be treated as a successful login.
