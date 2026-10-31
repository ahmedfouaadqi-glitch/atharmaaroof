# ATHAR backend setup (V1 foundation)

## Implemented in this branch
- Supabase cookie-aware server client for Next.js route handlers.
- `GET /api/reports`: lists only public-safe fields from `athar_public_reports`; supports optional `city`, `kind`, and bounded `limit`.
- `POST /api/reports`: validates a report, requires a signed-in Supabase user, and inserts an owner-bound row.
- SQL migration for private reports, owner-scoped RLS policies, a public-safe view, and an explicit `athar_admins` role table.
- `GET /api/admin/reports?status=pending` and `PATCH /api/admin/reports` for authenticated admin review; status changes go through a database function that verifies admin membership.
- The endpoint rejects long digit sequences and common identity/payment-secret terms as a conservative input check. This is not a complete DLP system.

## Setup
1. Create or select a Supabase project dedicated to ATHAR. Do not reuse a project for an unrelated application.
2. Apply `supabase/migrations/20261031000100_athar_reports.sql` using the Supabase migration workflow/SQL editor.
3. Copy `.env.example` to `.env.local` and set the project's URL and publishable key.
4. Configure Supabase Auth providers and redirect URLs for local and production domains.
5. Create the first account through `/login`, then promote only the intended administrator from the Supabase SQL Editor (replace the email below with that account's exact email):
```sql
insert into public.athar_admins (user_id)
select id from auth.users where lower(email) = lower('admin@example.com')
on conflict (user_id) do nothing;
```
6. Run `npm install`, then `npm run dev`; verify signup/login, authenticated insert, anonymous public listing, and that non-admin users receive `403` from the admin API.

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

## Explicit limitations
- The project code is not yet confirmed as migrated to the live Supabase project; verify the migration list and test the endpoints after applying it.
- An admin moderation API and database role gate exist, but there is no dedicated admin UI yet. CAPTCHA/abuse controls, image upload/redaction, matching, notifications, audit log, and production rate limiting are not implemented.
- The landing page now reads public reports from `GET /api/reports` and submits through `POST /api/reports`; it does not substitute demo reports if the API fails. Actual operation still depends on a configured and migrated Supabase project.
- New reports default to `pending` and are excluded from public listings until reviewed and explicitly published. A secure moderation/admin workflow is not implemented yet.
- Do not collect national identity numbers, payment card numbers, CVV, PIN, OTP, or exact GPS coordinates. Never publish phone numbers or identity-document images.
- The public view intentionally omits owner identifiers. RLS remains enabled on the underlying table.
