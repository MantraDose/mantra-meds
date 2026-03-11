# Task Group 2: GET /api/inventory/products — Implementation

**Completed:** 2026-03-07

## Summary

- **Response type:** Reused `ApiProduct` in `lib/types/product.ts`. Comment updated to note use by GET /api/inventory/products (Zoho Inventory) and that quantitySold/amount can come from Books or Inventory. No new type; Books consumers unchanged.
- **Route:** Added `app/api/inventory/products/route.ts`. GET handler: reads optional `search` query param; calls `fetchZohoInventoryItems()` then `fetchZohoInventorySalesByItemReport()`; maps items to `ApiProduct`, filters by `hasValidSkuAndPrice`, merges report via `mergeInventorySalesReportIntoProducts`, filters by search (name/SKU); returns JSON array. On items failure: 503 for "credentials not configured" / "not set", 502 otherwise; body `{ error: "Products unavailable. Please try again later." }`. No Zoho internals in response.
- **Tests:** Added `app/api/inventory/products/route.test.ts` (6 tests): 200 + array shape when Inventory returns items; search filter by name; 502 when API fails; 503 when credentials not configured; quantitySold/amount when report exists; null stats when report fetch fails. Mocks: `fetchZohoInventoryItems`, `fetchZohoInventorySalesByItemReport`.

## Files touched

- `lib/types/product.ts` — comment only (Inventory usage + source of stats)
- `app/api/inventory/products/route.ts` — new
- `app/api/inventory/products/route.test.ts` — new

## Run API route tests only

```bash
pnpm test:run -- app/api/inventory/products/route.test.ts
```

All 6 tests pass.
