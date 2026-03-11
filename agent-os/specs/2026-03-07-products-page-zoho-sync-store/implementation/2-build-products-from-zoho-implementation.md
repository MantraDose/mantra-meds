# Task Group 2: Build products from Zoho (sync job only) — Implementation

## Summary

- **2.1** Added `lib/inventory/build-products-from-zoho.test.ts` with 5 focused tests:
  - returns [] when Zoho items fetch fails
  - returns [] when Zoho items returns no items
  - maps items to ApiProduct and filters by hasValidSkuAndPrice (only items with SKU and price > 0)
  - merges sales report into products (quantitySold, amount) when report succeeds
  - products without report rows have null quantitySold and amount
  - Mocks: `fetchZohoInventoryItems`, `fetchZohoInventorySalesByItemReport`
- **2.2** Added `lib/inventory/build-products-from-zoho.ts`:
  - `mapZohoInventoryItemToProduct(item)` — same logic as former route
  - `hasValidSkuAndPrice(p)` — same as former route
  - `buildProductsFromZoho(): Promise<ApiProduct[]>` — calls fetchZohoInventoryItems, maps and filters, calls fetchZohoInventorySalesByItemReport, merges with mergeInventorySalesReportIntoProducts, returns result; returns [] when items fetch fails
- **2.3** Pipeline tests pass: `pnpm test:run -- lib/inventory/build-products-from-zoho.test.ts` (5 tests).

## Files

- `lib/inventory/build-products-from-zoho.ts` — new
- `lib/inventory/build-products-from-zoho.test.ts` — new

The existing route `app/api/inventory/products/route.ts` still uses Zoho directly; it will be switched to read from store in Task Group 4. The cron route (Task Group 3) will call `buildProductsFromZoho()` then `setProductsInStore()`.
