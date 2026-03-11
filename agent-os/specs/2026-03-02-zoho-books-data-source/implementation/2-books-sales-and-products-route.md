# Task Group 2 Implementation: Books sales-by-item and products route

**Spec:** 2026-03-02-zoho-books-data-source  
**Date:** 2026-03-02  
**Group:** 2 — API: Products route and sales-by-item

## Summary

- Replaced Zoho Inventory sales report with a Zoho Books–based implementation that lists invoices and aggregates line items by `item_id` to produce `quantity_sold` and `amount` per item.
- Wired GET `/api/products` to use `fetchZohoBooksItems` and the updated `fetchZohoSalesByItemReport` (Books invoices aggregation).
- Removed all Inventory dependency: deleted `lib/zoho/inventory.ts`, removed `inventoryBase` from config, and updated API route tests to mock `fetchZohoBooksItems`.

## Changes

### 2.1–2.2 `lib/zoho/reports.ts`

- **Books sales-by-item:** `fetchZohoSalesByItemReport()` now uses `config.booksBase`, GET `/invoices` to list invoices, then GET `/invoices/{id}` for up to `MAX_INVOICES_TO_FETCH` (20) invoices to load `line_items`. Aggregates by `item_id`: sums `quantity` and `item_total` (or `rate * quantity`) into rows with `item_id`, `quantity_sold`, `amount`. Returns `{ ok: true, rows }` or `{ ok: false, message }`. Same error handling (config/auth/generic).
- **Merge:** Unchanged from Group 1: merge sets only `quantitySold` and `amount`; no `averagePrice`. `SalesByItemRow` keeps optional `average_price` for test compatibility.

### 2.3 `app/api/products/route.ts`

- Imports `fetchZohoBooksItems` and `ZohoBooksItem` from `@/lib/zoho/books-items`.
- Replaced `mapZohoItemToProduct(item: ZohoInventoryItem)` with `mapZohoItemToProduct(item: ZohoBooksItem)` (same shape: `item_id`, name, sku, rate, status).
- Flow unchanged: fetch items → map → filter by sku/price → fetch sales report → merge → filter by search → return JSON. Response shape: id, name, sku, price, status, quantitySold, amount (no averagePrice). 503/502 and generic error message preserved.

### 2.4 Remove Inventory dependency

- **Deleted** `lib/zoho/inventory.ts`.
- **Config:** Removed `ZOHO_INVENTORY_BASE` and `inventoryBase` from `lib/zoho/config.ts`. Config now exposes only `booksBase` and existing auth/org fields.
- **Token:** Updated JSDoc reference from Inventory OAuth to Books OAuth.
- **Tests:** `app/api/products/route.test.ts` now mocks `@/lib/zoho/books-items` (`mockFetchZohoBooksItems`). All eight route tests pass.

## Verification

- `pnpm test -- app/api/products/route.test.ts lib/zoho/reports.test.ts` — all tests pass.
- No references to `lib/zoho/inventory` or `fetchZohoInventoryItems` remain in the codebase.

## Note on Books sales data

Sales-by-item is derived from **invoices** only: list invoices (one call), then fetch full details for up to 20 invoices to read `line_items`. More invoices could be supported later with pagination and a higher cap, at the cost of extra API calls. If Zoho Books adds a dedicated “sales by item” report endpoint, it can replace this aggregation.

## Next

- Group 3: Remove any remaining Inventory references (none left), update README for Books setup and scopes. Products page table and Average Price column were already updated in Group 1.
