# Task Group 2: Products API with Stats

**Spec:** 2025-03-02-product-row-basic-stats  
**Completed:** 2025-03-02

## Summary

- **GET /api/products** now fetches the Sales-by-Item report after loading inventory items, merges report rows with products via `mergeSalesReportIntoProducts`, and returns extended `ApiProduct` (with `quantitySold`, `amount`, `averagePrice` or null).
- When the report fetch fails or returns `ok: false`, the route still returns 200 with the product list; stats are null for all products (merge is called with an empty `rows` array).
- Inventory fetch failure still returns 502/503 as before; only the report is optional.
- **Tests:** Mocked `fetchZohoSalesByItemReport` in `app/api/products/route.test.ts`; added 3 tests: (1) response includes quantitySold, amount, averagePrice when report has data, (2) 200 with null stats when report fails, (3) search and base shape unchanged when report is used. Default mock in `beforeEach` is `{ ok: false }` so existing 5 tests still pass. Total: 8 route tests.

## Files Touched

- `app/api/products/route.ts` — import report fetch and merge; after mapping/filtering products, call `fetchZohoSalesByItemReport()`, then `mergeSalesReportIntoProducts(products, reportResult.ok ? reportResult.rows : [])`, then filter by search.
- `app/api/products/route.test.ts` — mock `@/lib/zoho/reports` (report fetch only, merge stays real); `beforeEach` sets report mock to `{ ok: false }`; added 3 tests for stats present, stats null on report failure, search + shape unchanged.
