# Database setup (Supabase)

`supabase/migrations/` is the **single authoritative source** for the database schema.

Apply migrations with the Supabase CLI (`supabase db push`), or by running the SQL file(s) manually in the **Supabase SQL Editor** in filename order.

The current baseline (`migrations/20260805000000_baseline_schema.sql`) is a verified snapshot of the live production schema as of its generation date. Older incremental scripts live under `supabase/legacy/` for historical reference only — do not run them against a live project.

## Recreating an environment from the repo

1. Create a Supabase project and configure Auth (email/password or your provider).
2. Apply the migration(s) in `supabase/migrations/` (CLI or SQL Editor, filename order).
3. Create the first **super admin** user in Supabase Auth, then insert a `profiles` row with `role = 'super_admin'`.
4. Use the admin UI (`/admin`) or secured admin APIs to create stores and store owners.
5. Copy `.env.example` → `.env.local` and set Supabase + optional Cloudinary/OpenAI keys.
6. `npm install` && `npm run dev`.

`types/db.ts` documents the column names the app expects.

## Auto-translation (OpenAI)

When `OPENAI_API_KEY` is set on the server, saving **categories**, **menu items**, or **welcome settings** in the owner dashboard calls `lib/ai/translate-content.ts` once and stores `*_ar`, `*_he`, `*_en` columns. Public pages read those fields — they do **not** call OpenAI at request time.

Requires the multilingual content columns from the baseline schema. Optional: `OPENAI_MODEL` (default `gpt-4o-mini`).

## App writes vs RLS

Dashboard and API mutation routes use the **service role** (`createAdminClient()`), which bypasses RLS. Authorization is enforced in **Next.js API routes** (see `lib/auth/api-auth.ts`), not only by Postgres policies.

Public storefront reads also use the service role with queries scoped to **active** stores only (`lib/data/public-store.ts`).
