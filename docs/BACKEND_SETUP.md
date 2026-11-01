# ATHAR backend setup (V1 foundation)

## Implemented in this branch
- Supabase cookie-aware server client for Next.js route handlers.
- `GET /api/reports`: lists only public-safe fields from `athar_public_reports`; supports optional `city`, `kind`, and bounded `limit`.
- `POST /api/reports`: validates a report, requires a signed-in Supabase user, and inserts an owner-bound row.
- SQL migration for private reports, owner-scoped RLS policies, a public-safe view, an explicit `athar_admins` role table, and a status-change audit table.
- `GET /api/admin/reports?status=pending` and `PATCH /api/admin/reports` for authenticated admin review; status changes go through a database function that verifies admin membership.
- The endpoint rejects long digit sequences and common identity/payment-secret terms as a conservative input check. This is not a complete DLP system.

## Setup
1. Create or select a Supabase project dedicated to ATHAR. Do not reuse a project for an unrelated application.
2. Apply all migrations in timestamp order: `20261031000100_athar_reports.sql`, `20261101000100_athar_security_hardening.sql`, then `20261101000200_athar_nearby_reports.sql`. The first migration defines the owner-scoped report schema and the administrator moderation RPC.
3. Copy `.env.example` to `.env.local` and set the project URL plus either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferred) or `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The server client accepts both names.
4. On Netlify, install/enable the official Supabase integration for the team, then open **Project configuration → General → Supabase**, connect the ATHAR site to the exact ATHAR Supabase project, and select **Next.js**. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under **Project configuration → Environment variables**. Do not connect an unrelated project.
5. Ensure both Builds and Functions/runtime scopes are enabled for the variables; re-deploy after changing them. Never copy a service-role/secret key into any `NEXT_PUBLIC_*` variable.
6. Configure Supabase Auth anonymous sign-ins and the email provider, plus redirect URLs for local, deploy-preview, and production domains as applicable.
7. Create the first account through `/login`, then promote only the intended administrator from the Supabase SQL Editor (replace the email below with that account's exact email):
```sql
insert into public.athar_admins (user_id)
select id from auth.users where lower(email) = lower('admin@example.com')
on conflict (user_id) do nothing;
```
8. Run `npm install`, then `npm run dev`; verify signup/login, anonymous session creation, authenticated report insert, anonymous public listing, report moderation, and that non-admin users receive `403` from the admin API.
9. Before production use, confirm the migration list includes all three migrations, check the Supabase Data API exposure settings, and run security/performance advisors. Every exposed table/view requires explicit grants and RLS policies appropriate to its access model.

## API
- `GET /api/reports?city=بغداد&kind=found&limit=20`
- `POST /api/reports` (requires a valid authenticated session cookie):
```json
{
  "kind": "lost",
  "category": "إجازة سوق",
  "title": "إجازة سوق مفقودة",
  "city": "بغداد",
  "area": "الكرادة",
  "details": "فُقدت قرب مكان عام"
}
```

## Netlify deployment notes
- Netlify's official Supabase integration injects Next.js project variables such as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Supabase credentials are project-specific. A URL alone is insufficient; the URL and public key must originate from the same Supabase project.
- Optional AI completion uses `ATHAR_AI_CHAT_COMPLETIONS_URL`, `ATHAR_AI_API_KEY`, and `ATHAR_AI_MODEL` as server-only variables. Without all three, the assistant uses database-backed search and deterministic guidance.
- Netlify environment changes take effect only after a new build/deploy. Apply variables separately to deploy previews and production as intended.

## Explicit limitations
- The project code is not yet confirmed as migrated to the live Supabase project; verify the migration list and test the endpoints after applying it.
- The admin moderation API and Arabic review UI are available at `/admin/reports`; initial admin membership still must be assigned manually in Supabase after signup. CAPTCHA/abuse controls, image upload/redaction, matching, notifications, and production rate limiting are not implemented. Status-change audit events are stored in the database, but a dedicated audit-history screen is not included yet.
- The landing page now reads public reports from `GET /api/reports` and submits through `POST /api/reports`; it does not substitute demo reports if the API fails. Actual operation still depends on a configured and migrated Supabase project.
- New reports default to `pending` and are excluded from public listings until an authenticated administrator explicitly publishes them.
- Do not collect national identity numbers, payment card numbers, CVV, PIN, OTP, or exact GPS coordinates. Never publish phone numbers or identity-document images.
- The public view intentionally omits owner identifiers. RLS remains enabled on the underlying table.
