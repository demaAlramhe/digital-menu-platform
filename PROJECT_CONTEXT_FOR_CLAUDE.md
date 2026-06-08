# Project Context for Claude

> **Purpose:** This document summarizes the **Digital Menu Platform** so an AI assistant can continue development with full context without reading the entire codebase first.
>
> **Last updated from codebase review:** May 2026  
> **Repo name (package.json):** `multi-store-app`  
> **Product name in UI:** MenuQR — Digital Menu & QR Code for Restaurants

---

## 1. Project Overview

This is a **multi-tenant digital menu SaaS** for restaurants and cafes.

**Customer flow:**
1. Customer scans a **QR code** or opens a share link.
2. They land on a **premium welcome screen** at `/{storeSlug}` (logo, headline, subtitle, language switcher, “Start Now” CTA).
3. They tap through to the **menu** at `/{storeSlug}/menu` — browse categories, then items with prices, images, and descriptions.
4. A **draggable floating phone button** (`tel:`) lets them call the restaurant.

**Owner flow:**
- Restaurant owners log in and manage their store from `/dashboard`: menu items, categories, branding/settings, QR code.
- They write content **once** in their chosen language; the server can **auto-translate** to Arabic, Hebrew, and English on save (stored in DB — not translated at page load).

**Platform admin flow:**
- A **super admin** manages all stores and users from `/admin`: create stores, assign owners, edit users, archive stores.

**What this is NOT (removed / out of scope):**
- No e-commerce cart, checkout, or orders in the current codebase.
- No env-based `ADMIN_EMAIL` / `ADMIN_PASSWORD` — auth is **Supabase Auth** + `profiles.role`.

---

## 2. Tech Stack

| Layer | Technology |
|--------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) App Router (`app/`) |
| **Language** | TypeScript 5.8 |
| **UI** | React 19 |
| **Styling** | Tailwind CSS v4 (`@import "tailwindcss"` in `app/globals.css`) |
| **Validation** | Zod v4 (`lib/api/schemas.ts`) |
| **Database** | Supabase (PostgreSQL) via `@supabase/supabase-js` + `@supabase/ssr` |
| **Auth** | Supabase Auth (email/password); roles in `profiles` table |
| **Image storage** | Cloudinary (signed uploads from dashboard) |
| **AI translation** | OpenAI Chat Completions API (`lib/ai/translate-content.ts`) — optional |
| **QR display** | `qrcode.react` |
| **Dev server** | `next dev --turbopack` |

**Important packages (`package.json`):**
- `next`, `react`, `react-dom`
- `@supabase/supabase-js`, `@supabase/ssr`
- `zod`
- `qrcode.react`
- `tailwindcss`, `@tailwindcss/postcss`

**Hosting assumptions:**
- Designed for **Vercel** or similar Node hosting (Next.js `build` / `start`).
- `NEXT_PUBLIC_SITE_URL` should be set in production for correct QR/public URLs.
- Supabase project is external (hosted by Supabase).
- Cloudinary is external.
- Windows + OneDrive paths can cause `.next` build issues (`EINVAL`) — delete `.next` and rebuild if needed.

**No Server Actions folder:** mutations go through **Route Handlers** under `app/api/`.

---

## 3. Folder and File Structure

```
digital-menu-platform/
├── app/                    # Next.js App Router — pages & API routes
├── components/             # React components (dashboard, storefront, admin, i18n, ui)
├── lib/                    # Business logic, auth, data access, AI, i18n, utils
├── types/                  # TypeScript types (db.ts, store.ts, rows.ts)
├── supabase/               # SQL migration scripts (not full base schema)
├── middleware.ts           # Auth gate + public locale cookie from ?lang=
├── .env.example            # Documented env vars (copy to .env.local)
├── next.config.ts
├── package.json
└── PROJECT_CONTEXT_FOR_CLAUDE.md  # This file
```

### `app/` — Routes and API

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Marketing/landing homepage for the SaaS product |
| `app/layout.tsx` | Root layout: `LocaleProvider`, `lang`/`dir` from cookie |
| `app/globals.css` | Tailwind + print styles for QR poster |
| `app/[storeSlug]/` | Public storefront per restaurant |
| `app/dashboard/` | Store owner panel (protected) |
| `app/admin/` | Super admin panel (protected) |
| `app/auth/` | Login + post-login redirect |
| `app/api/` | REST-style Route Handlers for CRUD, uploads, locale, admin |

### `components/`

| Folder | Purpose |
|--------|---------|
| `components/storefront/` | Public customer UI: welcome, menu browser, cards, backdrop, phone FAB |
| `components/dashboard/` | Owner forms, QR, uploads, shared dashboard UI tokens |
| `components/admin/` | Super-admin forms and user/store management widgets |
| `components/i18n/` | Language switcher, nav bars, locale provider |
| `components/layout/` | `AppShell` — generic page shell for admin/legacy pages |
| `components/ui/` | Small shared primitives (`Card`, etc.) |

### `lib/`

| Folder | Purpose |
|--------|---------|
| `lib/auth/` | `getCurrentProfile`, `requireStoreOwner`, `requireSuperAdmin`, API auth helpers |
| `lib/supabase/` | `client`, `server`, `admin` (service role), `middleware`, column error retry |
| `lib/data/` | `public-store.ts`, `owner-store.ts` — scoped DB reads |
| `lib/content/` | Locale picking, public menu resolution, retranslate batch job |
| `lib/ai/` | `translate-content.ts`, `trilingual-db.ts` |
| `lib/api/` | Zod schemas + JSON body validation |
| `lib/i18n/` | Dictionaries (`ar`, `he`, `en`), server locale from cookie |
| `lib/storefront/` | Premium dark/gold theme tokens |
| `lib/dashboard/` | Translation feedback messages, success query builders |
| `lib/cloudinary/` | Allowed upload folders |
| `lib/utils/` | Slugs, public URLs, WhatsApp helpers |
| `lib/middleware/` | Public `?lang=` cookie handling |

### `types/`

- `types/db.ts` — Supabase table shapes (source of truth for columns)
- `types/store.ts` — Domain models with `TrilingualField`
- `types/rows.ts` — Row type aliases

### `supabase/`

SQL **extensions** only (base `CREATE TABLE` is assumed external). See `supabase/README.md` for run order:
1. `store-welcome-columns.sql`
2. `store-menu-background.sql`
3. `multilingual-content-columns.sql`
4. `profiles-rls.sql`
5. `store-owner-rls.sql`
6. `public-menu-rls.sql`

### No `actions/` folder

All server mutations use `app/api/**/route.ts`.

### `public/` assets

No dedicated `public/` image assets folder in repo — images are Cloudinary URLs stored in DB.

---

## 4. Main Routes and Pages

### Public (customers)

| URL | What it shows | Key files |
|-----|---------------|-----------|
| `/` | SaaS marketing landing | `app/page.tsx`, `components/i18n/site-header.tsx` |
| `/{storeSlug}` | Welcome screen (always shown for active stores) | `app/[storeSlug]/page.tsx`, `components/storefront/store-welcome-screen.tsx` |
| `/{storeSlug}/menu` | Category list → item list (premium glass UI) | `app/[storeSlug]/menu/page.tsx`, `components/storefront/public-menu-browser.tsx` |

**Locale:** Cookie `menu-locale` (`ar` \| `he` \| `en`). Set via `?lang=` on public URLs (middleware) or language buttons on welcome/menu. Default UI locale: **Hebrew** (`DEFAULT_LOCALE` in `lib/i18n/types.ts`).

**QR / share URL:** Always `/{storeSlug}` (welcome entry) — `lib/utils/public-menu-url.ts` → `buildPublicEntryUrl()`.

### Auth

| URL | Who | Purpose |
|-----|-----|---------|
| `/auth/login` | Unauthenticated users | Email/password login form |
| `/auth/redirect` | Logged-in users | Redirects to `/admin` or `/dashboard` by role |

### Store owner dashboard (`store_owner` role)

| URL | Purpose |
|-----|---------|
| `/dashboard` | Overview / quick links |
| `/dashboard/menu-items` | List menu items (filter by category) |
| `/dashboard/menu-items/new` | Create item |
| `/dashboard/menu-items/[id]/edit` | Edit item |
| `/dashboard/categories` | List categories |
| `/dashboard/categories/new` | Create category |
| `/dashboard/categories/[id]/edit` | Edit category |
| `/dashboard/settings` | Store branding, welcome text, content language, images |
| `/dashboard/qr` | QR code + public links |
| `/dashboard/qr/poster` | Printable QR poster |

Protected by: `middleware.ts` + `app/dashboard/layout.tsx` → `requireStoreOwner()`.

### Super admin (`super_admin` role)

| URL | Purpose |
|-----|---------|
| `/admin` | Platform stats / overview |
| `/admin/stores` | List/create stores |
| `/admin/stores/[storeId]` | Edit store details |
| `/admin/users` | Manage users, roles, store assignment, edit name/email |

Protected by: `middleware.ts` + `app/admin/layout.tsx` → `requireSuperAdmin()`.

### API routes (`app/api/`)

| Endpoint | Method | Who | Purpose |
|----------|--------|-----|---------|
| `/api/locale` | POST | Anyone | Set `menu-locale` cookie |
| `/api/store-settings` | PATCH | Store owner | Update store + welcome + translate |
| `/api/store-content/retranslate` | POST | Store owner | Batch re-translate all menu/welcome content |
| `/api/menu-categories` | POST | Store owner | Create category + translate |
| `/api/menu-categories/[categoryId]` | PATCH, DELETE | Store owner | Update/delete category |
| `/api/menu-items` | POST | Store owner | Create item + translate |
| `/api/menu-items/[menuItemId]` | PATCH, DELETE | Store owner | Update/delete item |
| `/api/cloudinary/sign` | POST | Owner or super admin | Signed upload params |
| `/api/admin/stores` | POST | Super admin | Create store + owner user |
| `/api/admin/stores/[storeId]` | PATCH | Super admin | Update store |
| `/api/admin/stores/[storeId]/status` | PATCH | Super admin | active/inactive/archived |
| `/api/admin/users/[userId]/role` | PATCH | Super admin | Change role |
| `/api/admin/users/[userId]/store` | PATCH | Super admin | Assign store |
| `/api/admin/users/[userId]/profile` | PATCH | Super admin | Edit `full_name` + auth email |

### Dev-only

| URL | Purpose |
|-----|---------|
| `/test` | Supabase connection test (404 in production) |

---

## 5. Main Components

### Storefront (public, customer-facing)

| Component | What it does | Used on |
|-----------|--------------|---------|
| `StoreWelcomeScreen` | Full-screen welcome with logo, text, CTA, locale bar | `/{storeSlug}` |
| `StoreIntroLocaleBar` | ar/en/he buttons inside welcome card | Welcome screen |
| `StoreMenuLocaleBar` | ar/en/he buttons on menu page | `/{storeSlug}/menu` |
| `PublicMenuBrowser` | Category rows → item grid; client-side section navigation | Menu page |
| `MenuItemCard` | Single dish card (image, name, price, description, featured badge) | Menu browser |
| `StorePremiumBackdrop` | Blurred full-page background image | Welcome + menu |
| `StorePremiumGlass` | Dark glass card container | Welcome + menu |
| `StoreFloatingPhoneButton` | Draggable `tel:` FAB (position saved in localStorage) | Menu page |
| `MenuSectionHeading` | Section title styling | Item list view |
| `StoreContact` | Contact block with WhatsApp — **exists but not currently imported on menu** | Orphan / legacy |

### Dashboard (store owner)

| Component | Purpose |
|-----------|---------|
| `StoreSettingsForm` | Branding, welcome, menu background, content language |
| `RetranslateContentButton` | One-click batch AI translation |
| `NewCategoryForm` / `EditCategoryForm` | Category CRUD |
| `NewMenuItemForm` / `EditMenuItemForm` | Menu item CRUD |
| `MenuItemImageUpload` | Cloudinary upload widget |
| `StoreQrCard` | QR + copy link |
| `QrPoster` | Print layout |
| `PublicLinkActions` | Preview/copy welcome + menu URLs |
| `dashboard/ui/*` | Design system: `styles.ts`, forms, buttons, stat cards |

### Admin (super admin)

| Component | Purpose |
|-----------|---------|
| `AdminCreateStoreForm` | New store + owner account |
| `AdminEditStoreForm` | Edit store fields |
| `AdminUserRoleSelect` | Role dropdown |
| `AdminUserStoreSelect` | Store assignment |
| `AdminUserProfileEdit` | Edit user name + email |
| `AdminStoreStatusButton` | Activate/deactivate/archive |

### i18n / layout

| Component | Purpose |
|-----------|---------|
| `LocaleProvider` | React context for `locale` + `dict` |
| `LanguageSwitcher` | UI language toggle (dashboard/admin/login) |
| `DashboardNav` / `AdminNav` | Sticky nav with mobile menu |
| `AppShell` | Title/subtitle page wrapper |

**Reusable vs client-specific:**
- **Reusable:** All dashboard/admin/storefront components, theme tokens, i18n system.
- **Client-specific (data-driven):** Logo, colors, categories, items, welcome text, phone — all from `stores` / `menu_*` tables per `storeSlug`.

---

## 6. Data Model / Database Structure

**Source of truth:** `types/db.ts`  
**Note:** Base `CREATE TABLE` scripts are **not** in the repo — only `ALTER TABLE` migrations in `supabase/`.

### Tables

#### `stores`
One row per restaurant/cafe.

| Important fields | Notes |
|------------------|-------|
| `id`, `slug`, `name` | `slug` used in public URL |
| `status` | `active` \| `inactive` \| `archived` — only **active** stores are public |
| `primary_color`, `secondary_color` | Brand colors (menu cards) |
| `logo_url`, `banner_url`, `hero_image_url`, `menu_background_url` | Cloudinary URLs |
| `welcome_title`, `welcome_subtitle`, `welcome_button_text` | Legacy/source text |
| `welcome_title_ar/he/en`, etc. | Auto-translated welcome fields |
| `default_content_language` | Owner input language: `ar` \| `he` \| `en` |
| `show_welcome_screen` | DB column exists; settings form currently always saves `true` |
| `phone`, `email`, `address` | Contact info |

#### `profiles`
Linked 1:1 to Supabase Auth `users.id`.

| Fields | Notes |
|--------|-------|
| `id` | Same as auth user UUID |
| `full_name` | Display name |
| `role` | `super_admin` \| `store_owner` |
| `store_id` | FK to `stores` (null for super_admin) |

#### `menu_categories`

| Fields | Notes |
|--------|-------|
| `store_id` | Tenant scope |
| `name` + `name_ar/he/en` | Source + translations |
| `slug`, `sort_order`, `is_active` | URL-safe id + ordering |

#### `menu_items`

| Fields | Notes |
|--------|-------|
| `store_id`, `category_id` | Tenant + optional category |
| `name` + `name_ar/he/en` | Dish name translations |
| `description` + `description_ar/he/en` | Optional descriptions |
| `price`, `image_url` | Price (number), Cloudinary image |
| `is_active`, `is_featured`, `sort_order` | Visibility + featured section |

### Relationships

```
profiles.store_id → stores.id
menu_categories.store_id → stores.id
menu_items.store_id → stores.id
menu_items.category_id → menu_categories.id (nullable)
profiles.id → auth.users.id (Supabase Auth)
```

### Images

- Stored as **URL strings** in DB (`logo_url`, `image_url`, etc.).
- Uploaded via **Cloudinary** signed uploads (`/api/cloudinary/sign`).
- Folders defined in `lib/cloudinary/folders.ts` (e.g. `digital-menu-platform/menu-items`).

### Public read path

`lib/data/public-store.ts` uses **service role** client, filters `status = 'active'`, with fallback selects if multilingual columns are missing (pre-migration).

### Authorization model

- **RLS policies** exist in SQL files but **dashboard writes bypass RLS** via `createAdminClient()` (service role).
- Authorization enforced in **API route handlers** (`lib/auth/api-auth.ts`).

---

## 7. Admin Panel Logic

### Two admin levels

1. **Super admin** (`/admin`) — platform operator  
2. **Store owner** (`/dashboard`) — single restaurant manager  

There is no separate “restaurant admin” role beyond `store_owner`.

### Login

1. User submits email/password at `/auth/login` → Supabase `signInWithPassword`.
2. Redirect to `/auth/redirect` → reads `profiles.role`:
   - `super_admin` → `/admin`
   - `store_owner` → `/dashboard`
3. `middleware.ts` blocks `/dashboard` and `/admin` without session.

### Super admin: stores

- **Create:** `POST /api/admin/stores` — creates Supabase auth user, `stores` row, `profiles` row (`store_owner`), default `General` category.
- **Edit:** `PATCH /api/admin/stores/[storeId]`
- **Status:** `PATCH /api/admin/stores/[storeId]/status`

Files: `app/admin/stores/*`, `components/admin/admin-*-form.tsx`.

### Super admin: users

- List profiles + auth emails on `app/admin/users/page.tsx`.
- Patch role, store assignment, name/email via API routes under `app/api/admin/users/`.

### Store owner: categories & items

- **Create/update** via forms → `fetch()` to `/api/menu-categories` or `/api/menu-items`.
- On save, server calls `translateContentFields()` then writes `*_ar`, `*_he`, `*_en`.
- **Delete** via `DELETE` on same API routes.
- Forms: `components/dashboard/new-*-form.tsx`, `edit-*-form.tsx`.

### Store owner: settings

- `PATCH /api/store-settings` — name, colors, images, welcome text, `default_content_language`.
- Uses `updateStoreOmittingMissingColumns()` if DB migrations are incomplete.

### Store owner: images

1. `MenuItemImageUpload` requests signature from `/api/cloudinary/sign`.
2. Client uploads directly to Cloudinary.
3. Returned URL saved in form state → sent to API on save.

### Batch retranslation

- `POST /api/store-content/retranslate` — re-runs OpenAI for all categories, items, welcome text.
- Button in settings: `RetranslateContentButton`.

---

## 8. Public Menu Logic

### Welcome page (`/{storeSlug}`)

1. `getActiveStoreBySlug(slug)` — 404 if missing or not active.
2. `resolveWelcomeContent(store, dict, locale)` picks `welcome_*_ar/he/en` with fallback chain.
3. CTA button: stored translations or dictionary `welcomeCta` (“Start Now” / “ابدأ الآن” / “התחל עכשיו”).
4. Link to menu includes `?lang=` for shareable locale: `withPublicLangParam()`.

### Menu page (`/{storeSlug}/menu`)

1. Load categories + items via `getPublicMenuForStore()`.
2. `resolvePublicCategories()` / `resolvePublicMenuItems()` pick localized fields for viewer locale.
3. `buildMenuSections()` builds:
   - **Featured** section (items with `is_featured`)
   - One section per active category
   - **Uncategorized** bucket if needed
4. `PublicMenuBrowser` (client):
   - **Level 1:** Vertical list of category **rows** (name + thumbnail from first item image).
   - **Level 2:** Grid of `MenuItemCard` for selected category.
   - Back button returns to categories.

### Prices / images / descriptions

- Price: `item.price` (number) on card.
- Image: `image_url` from Cloudinary; category thumb from first item with image.
- Description: localized `description_*` fields.

### Mobile design

- `100dvh` welcome, safe-area padding, mobile-first Tailwind.
- Floating phone button: draggable, default bottom-right, compact size.
- Category rows full-width; item grid `grid-cols-1` on mobile, more columns on `sm+`.
- Menu locale bar fixed at top on menu page.

### Content language vs UI language

- **UI language** (buttons, labels): from `menu-locale` cookie → `dict` from `lib/i18n/dictionaries/`.
- **Menu content** (dish names): from DB `*_ar/he/en` columns — **not** translated at runtime.
- If `name_en` is empty, fallback shows Arabic (or source language) — common issue if `OPENAI_API_KEY` was missing when items were saved.

---

## 9. Environment Variables

**Do not commit real values.** Copy `.env.example` → `.env.local`.

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site URL (recommended for production QR/links)
NEXT_PUBLIC_SITE_URL=

# Cloudinary (required for dashboard image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OpenAI (optional — enables auto-translation on save)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

**Not used in this project:**
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — super admin is a normal Supabase user with `profiles.role = 'super_admin'`.

**Security notes:**
- `SUPABASE_SERVICE_ROLE_KEY` and `CLOUDINARY_API_SECRET` and `OPENAI_API_KEY` must stay **server-only**.
- Service role is used extensively for public reads and owner writes — protect deployment secrets.

---

## 10. Reusable Product Structure

### Reusable for new restaurant clients (same codebase)

| Module | Location |
|--------|----------|
| Multi-tenant store routing | `app/[storeSlug]/` |
| Premium public UI | `components/storefront/`, `lib/storefront/premium-theme.ts` |
| Owner dashboard | `app/dashboard/`, `components/dashboard/` |
| Super admin platform | `app/admin/`, `components/admin/` |
| Menu/category CRUD APIs | `app/api/menu-*` |
| Cloudinary upload flow | `app/api/cloudinary/sign`, `MenuItemImageUpload` |
| QR + poster | `dashboard/qr`, `components/dashboard/qr-poster.tsx` |
| i18n UI (ar/he/en) | `lib/i18n/` |
| AI content translation | `lib/ai/translate-content.ts` |
| Design tokens (dashboard) | `components/dashboard/ui/styles.ts` |

### Per-client customization (data, not code)

| Item | Where configured |
|------|------------------|
| Business name | `stores.name` |
| URL slug | `stores.slug` |
| Logo / backgrounds | Settings → Cloudinary URLs |
| Brand colors | `primary_color`, `secondary_color` |
| Categories & dishes | Dashboard CRUD |
| Welcome text | Settings |
| Content language | `default_content_language` |
| Phone / email / address | Settings |
| Domain | Deployment `NEXT_PUBLIC_SITE_URL` |
| QR target | Always `/{slug}` welcome entry |

**Onboarding a new client (typical):**
1. Super admin creates store + owner at `/admin/stores`.
2. Owner logs in, sets branding in `/dashboard/settings`.
3. Owner adds categories and menu items.
4. Owner prints QR from `/dashboard/qr`.
5. Run SQL migrations if new Supabase project.

---

## 11. Current Problems / Risks / TODOs

### Database / migrations

- **No base schema in repo** — new environments need manual table creation matching `types/db.ts`.
- **Column migration drift** — code has fallbacks for missing columns (`lib/supabase/column-errors.ts`, `lib/data/public-store.ts`) but features silently degrade.
- **`show_welcome_screen`** — column exists; UI always forces `true` on save; README mentions conditional QR behavior that **does not match** `buildPublicEntryUrl()` (always welcome URL).

### Translation

- Translation only on **save** — existing content stays monolingual until re-saved or **Retranslate** is run.
- Without `OPENAI_API_KEY`, only source language is stored; English UI still shows Arabic menu text (fallback).
- `retranslateStoreContent()` processes items **sequentially** — slow/costly for large menus.

### Security

- **Service role** used for public reads and all owner writes — API route auth is the main gate; compromised service key exposes all tenant data.
- Super admin can change any user's email via Admin API — correct by design but high privilege.
- `/test` page exposes store data in development.

### Dead / unused code

- `components/storefront/store-contact.tsx` — not mounted on current menu page (contact is phone FAB only).
- `components/storefront/store-locale-bar.tsx` — may be unused (menu uses `StoreMenuLocaleBar`).

### UX / technical debt

- Default UI locale is **Hebrew** while many restaurants may expect **Arabic** default for customers.
- Windows OneDrive + `.next` can cause `EINVAL` on build.
- Featured items appear both in **Featured** section and potentially in category lists depending on filtering (featured items are excluded from category buckets in `menu/page.tsx` — good, but worth knowing).
- Admin `listUsers()` for email display may paginate poorly for large user bases.
- No automated tests in repo.
- `package.json` name `multi-store-app` vs folder `digital-menu-platform` — naming inconsistency.

### README accuracy

- Root `README.md` says QR may point to `/menu` when welcome disabled — **code always uses welcome URL**.

---

## 12. Suggested Next Improvements

### Product / sales readiness

1. **Client onboarding wizard** — settings → categories → first items → QR in one guided flow.
2. **Deployment checklist** doc: env vars, SQL order, first super admin, `NEXT_PUBLIC_SITE_URL`.
3. **Per-store preview links** with `?lang=` in dashboard.
4. **Template presets** — color palettes, welcome copy templates per cuisine type.

### Admin experience

5. Bulk import menu from CSV/Excel.
6. Duplicate store as template for new clients.
7. Dashboard analytics (QR scans — would need new table/telemetry).

### Public / mobile

8. Optional WhatsApp order button on menu (utility exists in `lib/utils/whatsapp.ts`, component exists but not wired).
9. PWA / add-to-homescreen for menu.
10. Skeleton loading states on public pages.

### i18n / content

11. Show translation status per item in dashboard (which locales are filled).
12. Background job queue for retranslation instead of sequential API calls.
13. Customer default locale from browser `Accept-Language` on first visit.

### Offers / specials

14. Dedicated **Offers** category or `is_promoted` flag with homepage section on menu.
15. Time-limited specials (start/end dates) — would need schema change.

### QR flow

16. Download QR as PNG/SVG from dashboard (currently React QR component + print poster).
17. UTM or tracking params on QR URLs.

---

## 13. How to Work With This Project

### Principles for future changes

1. **Do not rebuild from scratch** — extend existing patterns (Route Handlers, `translateContentFields`, `pickLocalizedText`, dashboard design tokens).
2. **Preserve structure** — `app/` routes, `lib/` logic, `components/` UI separation.
3. **Step-by-step changes** — small PRs; test owner + public + admin flows.
4. **Mobile-first** — public menu and welcome are phone-primary.
5. **RTL** — Arabic and Hebrew need `dir="rtl"` (root layout sets `dir` from locale). Storefront category rows use `dir="ltr"` for image layout — be careful when changing.
6. **Never expose secrets** — OpenAI, service role, Cloudinary secret stay in server routes only.
7. **Explain files before editing** — identify route, API handler, component, and migration needs first.

### Typical change map

| Task | Likely files |
|------|----------------|
| New public menu UI | `components/storefront/*`, `app/[storeSlug]/menu/page.tsx` |
| New owner field | `lib/api/schemas.ts`, `app/api/store-settings/route.ts`, `store-settings-form.tsx`, new SQL in `supabase/` |
| New API endpoint | `app/api/.../route.ts`, `lib/auth/api-auth.ts`, Zod schema |
| New translation field | `lib/ai/translate-content.ts`, API route insert/update, `types/db.ts`, SQL migration |
| New UI string | `lib/i18n/dictionaries/ar.ts`, `he.ts`, `en.ts` (Hebrew is the type source) |
| DB column | `supabase/*.sql`, `types/db.ts`, optional fallback in `column-errors.ts` |

### Commands

```bash
npm install
npm run dev          # http://localhost:3000 (port may vary)
npm run build        # production build
npm run lint
```

### Roles reference

| Role | Access |
|------|--------|
| `super_admin` | `/admin/*`, all admin APIs |
| `store_owner` | `/dashboard/*`, own `store_id` only |
| Anonymous | `/{storeSlug}`, `/{storeSlug}/menu` for active stores |

### Key files to read first when debugging

1. `types/db.ts` — schema
2. `middleware.ts` — auth + locale
3. `lib/data/public-store.ts` — public data loading
4. `lib/content/resolve-public-menu.ts` — how locale picks content
5. `lib/ai/translate-content.ts` — translation on save
6. `app/api/store-settings/route.ts` — owner settings pattern

---

*End of project context document.*
