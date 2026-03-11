# Task Group 1: Zoho Inventory Integration — Implementation

**Completed:** 2026-03-07

## Summary

- **Config:** Added `ZOHO_INVENTORY_BASE` to `lib/zoho/config.ts` with default `https://www.zohoapis.com/inventory/v1`. Exported as `inventoryBase` on the config object. Books config and credential env vars unchanged.
- **Inventory items:** Added `lib/zoho/inventory-items.ts` — `fetchZohoInventoryItems()` uses `getZohoAccessToken()` and `getZohoConfig().inventoryBase`, calls `GET /items`, returns `{ ok, items }` or `{ ok: false, message }`. Maps raw items (item_id, name, sku, rate, status).
- **Inventory sales-by-item:** Added `lib/zoho/inventory-reports.ts` — `fetchZohoInventorySalesByItemReport()` lists invoices, fetches up to 20 invoice details, aggregates line items by item_id (quantity_sold, amount). `mergeInventorySalesReportIntoProducts(products, rows)` merges by item_id or sku; products not in report get null quantitySold/amount.
- **Tests:**
  - `lib/zoho/inventory-items.test.ts`: config exposes inventoryBase (with mocked config); fetch returns ok+items, ok:false+message, and empty items when response items is not array. Mocks: `getZohoAccessToken`, `getZohoConfig`, and `fetch` for items response.
  - `lib/zoho/inventory-reports.test.ts`: merge by item_id, merge by sku, null when missing, extended shape, empty products. No live API calls.

## Files touched

- `lib/zoho/config.ts` — added `ZOHO_INVENTORY_BASE`, `inventoryBase`
- `lib/zoho/inventory-items.ts` — new
- `lib/zoho/inventory-reports.ts` — new
- `lib/zoho/inventory-items.test.ts` — new
- `lib/zoho/inventory-reports.test.ts` — new

## Run Inventory integration tests only

```bash
pnpm test:run -- lib/zoho/inventory-items.test.ts lib/zoho/inventory-reports.test.ts
```

All 9 tests pass (4 in inventory-items, 5 in inventory-reports).
