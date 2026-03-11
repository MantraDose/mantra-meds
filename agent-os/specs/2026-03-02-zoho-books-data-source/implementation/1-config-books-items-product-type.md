# Task Group 1 Implementation: Config, Books items module, and product type

**Spec:** 2026-03-02-zoho-books-data-source  
**Date:** 2026-03-02  
**Group:** 1 — Backend: Zoho config and Books items

## Summary

- Updated `lib/zoho/config.ts` to expose `booksBase` (Zoho Books API v3 base URL) and kept deprecated `inventoryBase` so existing Inventory callers still compile until Group 2 removes them.
- Added `lib/zoho/books-items.ts` implementing `fetchZohoBooksItems()` with the same result/error contract as the previous Inventory items fetch.
- Removed `averagePrice` from `lib/types/product.ts` and updated JSDoc to Zoho Books.
- Verified `lib/zoho/token.ts` uses only `accountsBase` and credential fields; no changes required.

## Changes

### 1.1 `lib/zoho/config.ts`

- Added `ZOHO_BOOKS_BASE` env (default `https://www.zohoapis.com/books/v3`) and exported as `booksBase`.
- Replaced `ZOHO_INVENTORY_ORGANIZATION_ID` with `ZOHO_ORGANIZATION_ID` for optional org ID.
- Kept deprecated `inventoryBase` (from `ZOHO_INVENTORY_BASE` or default `https://www.zohoapis.com`) so `lib/zoho/inventory.ts` and `lib/zoho/reports.ts` still compile; Group 2 will remove these callers and then `inventoryBase` can be removed.

### 1.2 `lib/zoho/books-items.ts` (new)

- Implements `fetchZohoBooksItems()`: uses `getZohoAccessToken()` and `getZohoConfig().booksBase`, GET `{booksBase}/items` with optional `?organization_id=`.
- Exports `ZohoBooksItem`, `ZohoBooksItemsResponse`, `ZohoItemsResult`, `ZohoItemsError`. Item shape matches what the products route expects (item_id, name, sku, rate, status).
- Same error handling as prior inventory module: config/auth errors → generic messages, no raw Zoho or credentials exposed.

### 1.3 `lib/types/product.ts`

- Removed `averagePrice` from `ApiProduct`.
- JSDoc updated to "Zoho Books" and "quantitySold, amount" only.

### 1.4 Token module

- No code changes. Token refresh uses `accountsBase`, `clientId`, `clientSecret`, `refreshToken`, `redirectUri` only; all remain in config.

## Verification

- Lint: no errors on modified files.
- Config and books-items are ready for Group 2 to wire the products route and replace Inventory usage.

## Next

- Group 2 will: implement Books sales-by-item, wire GET `/api/products` to `fetchZohoBooksItems` and the new report, then remove `lib/zoho/inventory.ts` and drop `inventoryBase` from config.

## Note on merge, page, and tests

So that removing averagePrice from ApiProduct did not break the build or tests, the following were updated: merge in reports.ts (no longer sets averagePrice), Products page (removed Average Price column, formatAveragePrice, PRODUCT_TABLE_COLUMNS = 6), reports.test.ts (no averagePrice assertions), route.test.ts (no averagePrice in response assertions), page.test.tsx (no Average Price column assertion, expandable row test replaced with six-column table assertion).
