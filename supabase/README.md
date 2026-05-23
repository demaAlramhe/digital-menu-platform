# Database setup (Supabase)

This repo does **not** include a full base schema (`CREATE TABLE` for `stores`, `profiles`, etc.). Those tables are assumed to exist in your Supabase project (created manually or from an external bootstrap).

Use this folder to **extend** an existing project and to apply **RLS** policies.

## Recommended run order

Run each script in the **Supabase SQL Editor** (or `psql`) in this order:

| Step | File | Purpose |
|------|------|---------|
| 0 | *(external)* | Base tables: `stores`, `profiles`, `menu_categories`, `menu_items`, auth users |
| 1 | `store-welcome-columns.sql` | Welcome screen columns (`show_welcome_screen`, `welcome_*`, `hero_image_url`) |
| 2 | `store-menu-background.sql` | Menu page background (`menu_background_url`) |
| 3 | `multilingual-content-columns.sql` | Localized `*_ar` / `*_he` / `*_en` columns + `default_content_language` |
| 4 | `profiles-rls.sql` | Profile row policies |
| 5 | `store-owner-rls.sql` | Owner-scoped policies on menu tables |
| 6 | `public-menu-rls.sql` | Public read policies (if used alongside anon client) |

Scripts are idempotent where possible (`ADD COLUMN IF NOT EXISTS`).

## Recreating an environment from the repo

1. Create a Supabase project and configure Auth (email/password or your provider).
2. Ensure base tables and foreign keys match what the app expects (`types/db.ts` is the source of truth for column names).
3. Run SQL files in the table above (steps 1–5).
4. Create the first **super admin** user in Supabase Auth, then insert a `profiles` row with `role = 'super_admin'`.
5. Use the admin UI (`/admin`) or secured admin APIs to create stores and store owners.
6. Copy `.env.example` → `.env.local` and set Supabase + optional Cloudinary/OpenAI keys.
7. `npm install` && `npm run dev`.

## App writes vs RLS

Dashboard and API mutation routes use the **service role** (`createAdminClient()`), which bypasses RLS. Authorization is enforced in **Next.js API routes** (see `lib/auth/api-auth.ts`), not only by Postgres policies.

Public storefront reads also use the service role with queries scoped to **active** stores only (`lib/data/public-store.ts`).
