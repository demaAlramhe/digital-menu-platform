# E2E testing (Playwright)

## Prerequisites

1. Copy `.env.local` with valid Supabase keys (same as local dev).
2. Copy `.env.e2e.example` → `.env.e2e.local` and fill test credentials.
3. Run SQL migrations (`supabase/pending-signups.sql`, etc.) on your test project.

## Install

```bash
npm install
npx playwright install chromium
```

## Run tests

```bash
# All tests (starts dev server automatically)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Headed browser
npm run test:e2e:headed

# HTML report after a run
npm run test:e2e:report
```

## What runs by default

| Suite | Requires | Writes data? |
|-------|----------|--------------|
| `public-website.spec.ts` | Supabase + `pending_signups` table | Yes — one pending signup |
| `admin-signups.spec.ts` (view) | `E2E_ADMIN_*` | No |
| `admin-signups.spec.ts` (approve) | `E2E_ALLOW_SIGNUP_APPROVE=true` | Yes — creates store + user |
| `owner-dashboard.spec.ts` | `E2E_OWNER_*` | Yes — category + item on test store |
| `customer-menu.spec.ts` | `E2E_TEST_STORE_SLUG` | No |
| `accessibility-ui.spec.ts` | Optional store slug for menu checks | No |

## Test database setup (recommended)

Use a **separate Supabase project** or dedicated test data:

1. **Super admin** — existing `super_admin` profile for `E2E_ADMIN_EMAIL`.
2. **Test store owner** — `store_owner` linked to a store slug you own for QA (e.g. `e2e-demo`).
3. Set `E2E_TEST_STORE_SLUG` to that slug only.
4. Keep `E2E_ALLOW_SIGNUP_APPROVE=false` until you intentionally test onboarding approval.

Do **not** run owner CRUD tests against production customer stores.

## Lighthouse (manual / CI suggestion)

After `npm run build && npm run start`, run Lighthouse on:

- `/`
- `/pricing`
- `/request?plan=pro`
- `/{E2E_TEST_STORE_SLUG}/menu`

Example with [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci):

```bash
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3000/ \
  --collect.url=http://localhost:3000/pricing \
  --collect.url=http://localhost:3000/request?plan=pro \
  --collect.url=http://localhost:3000/YOUR_STORE_SLUG/menu
```

Target scores before publish: Performance ≥ 80, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90 on mobile.
