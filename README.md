# Digital Menu Platform

Multi-tenant digital menu SaaS for restaurants and cafes. Built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Structure

- `app/` — App Router routes (auth, dashboard, admin, public storefront by `storeSlug`)
- `components/` — shared UI and layout components
- `lib/supabase/` — browser/server/middleware Supabase clients
- `types/` — tenant-aware domain and database types

## Quick Start

1. Install dependencies:
   - `npm install`
2. Create env file:
   - copy `.env.example` to `.env.local` (Supabase required; Cloudinary for uploads; OpenAI optional for auto-translation)
3. Run development server:
   - `npm run dev`

## Multi-Tenant Notes

- Tables: `stores`, `profiles`, `menu_categories`, `menu_items`
- Public store landing (welcome intro): `/{storeSlug}` — enable in dashboard settings
- Public menu URL per store: `/{storeSlug}/menu`
- QR codes use the public entry URL: `/{storeSlug}` when welcome is enabled, otherwise `/{storeSlug}/menu`
- Database migrations: see [`supabase/README.md`](supabase/README.md) for run order
- Use Supabase RLS so store owners only access rows matching their `store_id`
- Restrict `/admin/*` routes to `super_admin`
- Only `active` stores are publicly accessible
