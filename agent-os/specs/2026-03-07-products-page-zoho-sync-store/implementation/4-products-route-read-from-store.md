# Task Group 4: GET /api/inventory/products reads from store — Implementation

## Summary

- **4.1–4.2** GET /api/inventory/products now reads only from the store via `getProductsFromStore()`, applies `filterBySearch(products, search)` for the `search` query param, returns 200 + JSON array (ApiProduct[]). Empty store → 200 + []. On thrown error from store → 503 with "Products unavailable. Please try again later." No Zoho calls.
- **4.3** Replaced route tests: removed Zoho mocks, added mock for `getProductsFromStore`. Six tests: 200 + [] when store empty; 200 + array when store has data; filter by search (name); filter by search (SKU); 503 when store throws; 200 + [] when search matches nothing.
- **4.4** All route tests and Products page tests pass (6 + 12).

## Files

- `app/api/inventory/products/route.ts` — now uses `getProductsFromStore()` and local `filterBySearch` only
- `app/api/inventory/products/route.test.ts` — rewritten to mock store, same contract (search, shape, errors)

Products page is unchanged and still calls GET /api/inventory/products; it now receives data from the synced Supabase table instead of Zoho.
