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
   - copy `.env.example` to `.env.local`
3. Run development server:
   - `npm run dev`

## Multi-Tenant Notes

- Tables: `stores`, `profiles`, `menu_categories`, `menu_items`
- Public menu URL per store: `/{storeSlug}/menu`
- Use Supabase RLS so store owners only access rows matching their `store_id`
- Restrict `/admin/*` routes to `super_admin`
- Only `active` stores are publicly accessible
