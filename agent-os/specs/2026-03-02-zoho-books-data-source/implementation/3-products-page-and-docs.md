# Task Group 3 Implementation: Products page table and docs

**Spec:** 2026-03-02-zoho-books-data-source  
**Date:** 2026-03-02  
**Group:** 3 — Frontend and cleanup

## Summary

- Confirmed the Products page table already has 6 columns and no Average Price (done in Group 1).
- Confirmed no Inventory-specific code or config remains in `lib/zoho` or config.
- Updated README to state that the Products integration uses Zoho Books and to document OAuth scope and refresh token setup.

## Changes

### 3.1 Products page table

- **Already done in Group 1:** `app/dashboard/products/page.tsx` has `PRODUCT_TABLE_COLUMNS = 6`, no Average Price column, no `formatAveragePrice`, no `product.averagePrice`. Columns: Product, SKU, Price, Quantity Sold, Amount, Status. No code changes in Group 3.

### 3.2 Inventory-specific code

- **Verified:** `lib/zoho` has no references to "inventory" or "Inventory". `lib/zoho/reports.ts` uses only Books (`booksBase`, `/invoices`). `lib/zoho/config.ts` exposes only `booksBase` (no `inventoryBase`). Token module references Books OAuth in JSDoc. No code changes in Group 3.

### 3.3 README

- **Environment variables (Getting Started):** Replaced the single-line Zoho optional note with a short **Zoho Books (Products integration)** subsection: list `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, optional `ZOHO_REDIRECT_URI` and `ZOHO_ORGANIZATION_ID`. State that the refresh token must be generated with **Zoho Books** OAuth scope (e.g. `ZohoBooks.fullaccess.all` or `ZohoBooks.settings.READ,ZohoBooks.invoices.READ`) and point to Zoho API Console for Server-based Applications.
- **Tech Stack:** Updated the sentence about mock data to say the Products catalog is backed by **Zoho Books** (items and sales-by-item from invoices) when the Zoho env vars are set.
- **Deployment:** Updated the environment variables bullet to say the Products integration uses Zoho Books and that the refresh token must be generated with Zoho Books OAuth scope (e.g. `ZohoBooks.fullaccess.all`). No new env var names; same `ZOHO_*` vars.

## Verification

- README reads correctly and documents Books setup and scopes.
- No "inventory" naming in application code or config.

## Next

- Group 4: Update tests for Books and no averagePrice (API route and page tests were already updated in Groups 1–2; Group 4 can verify and run the full feature-related test set).
