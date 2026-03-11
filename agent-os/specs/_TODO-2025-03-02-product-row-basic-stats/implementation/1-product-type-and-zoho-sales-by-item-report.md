# Task Group 1: Product Type and Zoho Sales-by-Item Report

**Spec:** 2025-03-02-product-row-basic-stats  
**Completed:** 2025-03-02

## Summary

- Extended `ApiProduct` in `lib/types/product.ts` with optional `quantitySold`, `amount`, `averagePrice` (all `number | null`), documented as coming from Zoho report.
- Added `lib/zoho/reports.ts`: `SalesByItemRow` type, `fetchZohoSalesByItemReport()`, and `mergeSalesReportIntoProducts(products, rows)`.
- Report fetch uses existing `getZohoAccessToken()` and `getZohoConfig()`, calls `GET {inventoryBase}/inventory/v1/reports/item_sales`. Returns `{ ok: true, rows }` or `{ ok: false, message }`; does not throw.
- Merge matches report rows to products by `item_id` (product.id) first, then by `sku`. Products not in the report get `quantitySold`, `amount`, `averagePrice` set to `null`. Invalid numeric values in a row are normalized to `null`.
- Tests: `lib/zoho/reports.test.ts` — 7 focused tests for merge (by item_id, by sku, missing product, extended shape, prefer item_id over sku, empty products, NaN handling).

## Zoho Report Endpoint Note

The Zoho Inventory API v1 index does not document a dedicated Reports or "Sales by Item" endpoint. The implementation uses `GET /inventory/v1/reports/item_sales`. If this path returns 404 or an error, `fetchZohoSalesByItemReport()` returns `{ ok: false, message }`, and the products API (Task Group 2) can still return the product list with null stats. If your Zoho region or product uses a different path (e.g. from Zoho Books reports API), update `REPORTS_PATH` and the response parsing in `lib/zoho/reports.ts` accordingly. An alternative is to aggregate "Sales by Item" from the Invoices API line items if the report endpoint is unavailable.

## Files Touched

- `lib/types/product.ts` — extended `ApiProduct`
- `lib/zoho/reports.ts` — new (fetch + merge)
- `lib/zoho/reports.test.ts` — new (7 tests)
