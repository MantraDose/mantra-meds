# Task Breakdown: Zoho Books Data Source

## Overview

Total Tasks: 4 groups (Zoho/Backend, API Route, Frontend & Cleanup, Testing)

This spec has **no database layer**; the work is migrating from Zoho Inventory to Zoho Books in `lib/zoho`, updating the products API route, removing the average price column from the Products page, and updating tests. **Pauses** and **Tasks for you** are called out so you can verify work and complete any manual steps in tandem.

---

## Tasks for you (in tandem)

These require your action in the repo or in the browser; do them when each group asks.

- **[Before Group 1]** Confirm `.env.local` has `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` (Books-scoped token is already in place). Optionally `ZOHO_ORGANIZATION_ID` if you use multi-org in Books.
- **[After Group 1]** Optional: Request GET `/api/products` (or run a short script that calls the Books items fetch) to confirm the Books API returns items. If you see 502/503 or empty data, we can debug before Group 2.
- **[After Group 2]** Call GET `/api/products` and confirm the response includes products with `quantitySold` and `amount` (or null where no sales). Then proceed to Group 3.
- **[After Group 3]** Open the Products page in the browser; confirm the table has 6 columns (no Average Price), search/sort/pagination work, and there are no console or network errors.

---

## Task List

### Backend: Zoho config and Books items

#### Task Group 1: Config, Books items module, and product type
**Dependencies:** None

- [x] 1.0 Complete Zoho Books config and items integration
  - [x] 1.1 Update `lib/zoho/config.ts` for Books
    - Add or rename API base to Books base URL (e.g. `https://www.zohoapis.com/books/v3`). Use env `ZOHO_BOOKS_BASE` or repurpose existing base env; default to Books v3 URL.
    - Keep `clientId`, `clientSecret`, `refreshToken`, `redirectUri`, `accountsBase` unchanged. Keep optional `organizationId` (e.g. from `ZOHO_ORGANIZATION_ID`) if present for multi-org.
    - Remove or rename any "inventory" naming (e.g. `inventoryBase` → `booksBase` or `apiBase`) so callers use the Books base for data calls.
  - [x] 1.2 Create Books items module (replace Inventory items)
    - Add `lib/zoho/books-items.ts` (or replace `lib/zoho/inventory.ts` in place). Call Zoho Books List Items API (v3) using config base URL and existing `getZohoAccessToken()`.
    - Map Books response to a shared item shape (id, name, sku, rate, status). Handle Books field names (e.g. `item_id`, `name`, `sku`, `rate`, `status`).
    - Return `ZohoItemsResult | ZohoItemsError` (ok + items, or ok false + message). Do not expose raw Zoho errors or credentials. Use same error handling pattern as current inventory module (config missing, auth failed, generic failure).
  - [x] 1.3 Update `lib/types/product.ts`
    - Remove `averagePrice` from `ApiProduct`. Keep `id`, `name`, `sku`, `price`, `status`, `quantitySold`, `amount`. Update JSDoc to mention Zoho Books as source.
  - [x] 1.4 Ensure token module still works with config
    - If config key names changed (e.g. `inventoryBase` → `booksBase`), ensure `lib/zoho/token.ts` still imports and uses config correctly. Token URL stays accounts base; no change to token logic.

**Acceptance Criteria:**
- Config exposes a Books API base URL used by Books API calls; token refresh unchanged.
- Books items module fetches list of items from Zoho Books and returns result/error shape compatible with current route.
- `ApiProduct` no longer includes `averagePrice`.

**PAUSE — Check:** Optionally call GET `/api/products` (after Group 2 wires the route) or run a minimal script that calls the new Books items fetch to confirm Books returns data. Then proceed to Group 2.

---

### API: Products route and sales-by-item

#### Task Group 2: Books sales-by-item and products route
**Dependencies:** Task Group 1 (config + Books items + product type)

- [x] 2.0 Complete Books sales-by-item and wire products API
  - [x] 2.1 Implement Books sales-by-item data source
    - In `lib/zoho/reports.ts` (or a new `lib/zoho/books-reports.ts`): replace Inventory report with Books-based data. Use Books Invoices API to aggregate line items by item_id/sku (quantity + amount), or a Books report endpoint if available. Return rows with `item_id`/`sku`, `quantity_sold`, `amount` (no `average_price`).
    - Expose a function with the same contract as current sales report: result type `{ ok: true, rows } | { ok: false, message }`. Rows matchable to products by item_id or sku.
  - [x] 2.2 Update merge function to omit averagePrice
    - In the same file as the report: merge sales rows into products by item_id/sku. Set only `quantitySold` and `amount` on each product; do not set or reference `averagePrice`. Products not in the report keep null for quantitySold and amount.
  - [x] 2.3 Wire GET `/api/products` to Books
    - Replace `fetchZohoInventoryItems` with the new Books items fetch. Replace `fetchZohoSalesByItemReport` with the new Books sales-by-item fetch. Use the updated merge (no averagePrice).
    - Keep optional `search` query param and filterBySearch; keep hasValidSkuAndPrice; keep 503 (credentials not configured) and 502 (API failure) with generic error message only.
    - Response: array of products with id, name, sku, price, status, quantitySold, amount (no averagePrice).
  - [x] 2.4 Remove Inventory items dependency
    - Remove imports and usages of `lib/zoho/inventory.ts` from the codebase. Delete `lib/zoho/inventory.ts` once the Books items module is in use.

**Acceptance Criteria:**
- Products API fetches items from Books and sales-by-item data from Books; merge produces quantitySold and amount only.
- GET `/api/products` returns 200 with product array (no averagePrice); 503/502 on config/API failure with generic message.
- No remaining references to Inventory items module.

**PAUSE — Check:** Call GET `/api/products` and confirm products with quantitySold/amount (or null). Then proceed to Group 3.

---

### Frontend and cleanup

#### Task Group 3: Products page table and docs
**Dependencies:** Task Group 2 (API returning Books data)

- [x] 3.0 Remove Average Price column and finish cleanup
  - [x] 3.1 Remove Average Price from Products page table
    - In `app/dashboard/products/page.tsx`: remove the TableHead and TableCell for "Average Price". Remove `formatAveragePrice` and any use of `product.averagePrice`. Update `PRODUCT_TABLE_COLUMNS` from 7 to 6 if it exists and is used for layout/accessibility.
  - [x] 3.2 Remove remaining Inventory-specific code and references
    - Ensure `lib/zoho/reports.ts` (or books-reports) uses only Books endpoints; remove any Inventory report path or references. Remove or update `lib/zoho/config.ts` so no "inventory" naming remains. Confirm token module is the only shared Zoho code and that it does not reference Inventory.
  - [x] 3.3 Update README (or spec docs)
    - State that the Products integration uses Zoho Books. Document required OAuth scope (e.g. ZohoBooks.fullaccess.all or ZohoBooks.settings.READ,ZohoBooks.invoices.READ) and that the refresh token must be generated with that scope. Do not add new env var names; reference existing ZOHO_* vars.

**Acceptance Criteria:**
- Products page table has 6 columns: Product, SKU, Price, Quantity Sold, Amount, Status. No Average Price column or formatAveragePrice.
- No remaining Inventory-specific code or config naming; Books-only integration.
- README (or docs) describes Books setup and scopes.

**PAUSE — Check:** Open the Products page in the browser; confirm 6-column table, search, sort, pagination, and no errors. Then proceed to Group 4.

---

### Testing

#### Task Group 4: Update and run tests
**Dependencies:** Task Groups 1–3

- [x] 4.0 Update tests for Books and no averagePrice
  - [x] 4.1 Update API route tests (`app/api/products/route.test.ts`)
    - Mock the new Books items fetch and Books sales-by-item fetch instead of Inventory. Remove any assertions on `averagePrice` in the response. Keep tests for: 200 with products array, 502 on API failure, 503 when credentials not configured, search filtering, no Zoho/credentials in response body.
  - [x] 4.2 Update Products page tests (`app/dashboard/products/page.test.tsx`)
    - Remove expectations for "Average Price" column or averagePrice in mock data. Adjust column header assertions to 6 columns; remove averagePrice from mock products if present.
  - [x] 4.3 Update reports/merge unit tests (`lib/zoho/reports.test.ts` or equivalent)
    - Remove averagePrice from expected merged output and from test data. Ensure merge tests still verify matching by item_id/sku and setting quantitySold and amount.
  - [x] 4.4 Run feature-related tests
    - Run API route tests, Products page tests, and reports/merge tests. Fix any failures. Do not require running the full suite unless desired.

**Acceptance Criteria:**
- All updated tests pass. No tests assert on averagePrice or Average Price column.
- Mocks use Books modules; merge tests validate quantitySold/amount only.

---

## Execution Order

Recommended sequence:

1. **Task Group 1** (Zoho config, Books items, product type) → **PAUSE** → You: optional check that Books returns items.
2. **Task Group 2** (Books sales-by-item, API route, remove Inventory items) → **PAUSE** → You: confirm GET `/api/products` returns products with quantitySold/amount.
3. **Task Group 3** (Remove Average Price column, cleanup, README) → **PAUSE** → You: confirm Products page in browser.
4. **Task Group 4** (Update and run tests).

No database or migration tasks; implementation is confined to Zoho Books integration, products API, Products page table, and tests.
