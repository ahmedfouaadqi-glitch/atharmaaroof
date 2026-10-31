# ATHAR backend setup (V1 foundation)

## Implemented in this branch
- Supabase cookie-aware server client for Next.js route handlers.
- `GET /api/reports`: lists only public-safe fields from `athar_public_reports`; supports optional `city`, `kind`, and bounded `limit`.
- `POST /api/reports`: validates a report, requires a signed-in Supabase user, and inserts an owner-bound row.
- SQL migration for private reports, owner-scoped RLS policies, and a public-safe view that omits `owner_id` and contact fields.
- The endpoint rejects long digit sequences and common identity/payment-secret terms as a conservative input check. This is not a complete DLP system.

## Setup
1. Create or select a Supabase project dedicated to ATHAR. Do not reuse a project for an unrelated application.
2. Apply `supabase/migrations/20261031000100_athar_reports.sql` using the Supabase migration workflow/SQL editor.
3. Copy `.env.example` to `.env.local` and set the project's URL and publishable key.
4. Configure Supabase Auth providers and redirect URLs for local and production domains.
5. Run `npm install`, then `npm run dev`; verify authenticated insert and anonymous public listing before deployment.

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
- No live Supabase project has been connected or migrated yet.
- Sign-up/login UI, CAPTCHA/abuse controls, report moderation, image upload, matching, notifications, and production rate limiting are not implemented.
- The landing page now reads public reports from `GET /api/reports` and submits through `POST /api/reports`; it does not substitute demo reports if the API fails. Actual operation still depends on a configured and migrated Supabase project.
- New reports default to `pending` and are excluded from public listings until reviewed and explicitly published. A secure moderation/admin workflow is not implemented yet.
- Do not collect national identity numbers, payment card numbers, CVV, PIN, OTP, or exact GPS coordinates. Never publish phone numbers or identity-document images.
- The public view intentionally omits owner identifiers. RLS remains enabled on the underlying table.
