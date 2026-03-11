# Task Group 3: Cron route and store write — Implementation

## Summary

- **3.1** Added `app/api/cron/sync-inventory-products/route.test.ts` with 7 tests:
  - 401 when Authorization header is missing
  - 401 when Authorization header is wrong
  - 401 when CRON_SECRET is not set
  - With valid auth (Bearer or query `secret`), calls buildProductsFromZoho and setProductsInStore and returns 200
  - Accepts secret via query param when it matches CRON_SECRET
  - 503 with generic message when setProductsInStore throws (no Zoho/store details in response)
  - When buildProductsFromZoho returns [], still calls setProductsInStore([])
- **3.2** Created `app/api/cron/sync-inventory-products/route.ts`:
  - GET handler; auth via `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`
  - Calls buildProductsFromZoho() then setProductsInStore(products); returns 200 with `{ ok: true }` on success
  - Returns 503 with generic "Sync failed. Please try again later." on error (no internals exposed)
- **3.3** Documented cron: added `vercel.json` with `crons` entry for `/api/cron/sync-inventory-products` on schedule `0 * * * *` (hourly). Updated README Deployment section with CRON_SECRET and SUPABASE_SERVICE_ROLE_KEY. Added CRON_SECRET to `.env.example`.
- **3.4** Cron route tests pass: `pnpm test:run -- app/api/cron/sync-inventory-products/route.test.ts` (7 tests).

## Files

- `app/api/cron/sync-inventory-products/route.ts` — new
- `app/api/cron/sync-inventory-products/route.test.ts` — new
- `vercel.json` — new (crons)
- `README.md` — Deployment: CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY, cron note
- `.env.example` — CRON_SECRET

## Your tasks

- Set `CRON_SECRET` in Vercel (Environment Variables); use a random string (e.g. `openssl rand -hex 32`).
- Cron is configured in `vercel.json`; it runs in Production only. To change schedule, edit `schedule` in `vercel.json` (e.g. `0 0 * * *` for daily at midnight).
