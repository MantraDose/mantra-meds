# Task Breakdown: Products Page — Zoho Inventory API Switch

## Overview

Total task groups: 4. No database layer; work is Zoho Inventory integration (lib), new API route, Products page updates, and focused testing.

## Work you need to complete

These items are for you to do; the implementation assumes they are done when relevant.

| When                    | Your action                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Before Task Group 1** | Ensure your Zoho refresh token includes **Inventory** scopes (e.g. ZohoInventory.items.READ and any scope needed for sales-by-item reports). Same client id/secret; only the token value (and scopes) may need updating. If you need a new token, generate it in Zoho API Console with Inventory scopes and replace `ZOHO_REFRESH_TOKEN` in `.env.local`. |
| **After Task Group 1**  | Add `ZOHO_INVENTORY_BASE` to `.env.local` if you want to override the default (optional). Run the Inventory integration tests locally and confirm they pass.                                                                                                                                                                                              |
| **After Task Group 2**  | Call `GET /api/inventory/products` in browser or Postman (or run the app and open Network tab) and confirm the response shape and that real Zoho data appears if credentials are set.                                                                                                                                                                     |
| **After Task Group 3**  | Open the Products page in the app and confirm it loads from the new route, columns look correct (single Product with name + SKU, then Price, Quantity Sold, Amount, and Status if present), and search/sort/pagination work.                                                                                                                              |
| **After Task Group 4**  | Run the full feature-specific test set locally and fix any failures; optionally run the full test suite if you want to guard against regressions.                                                                                                                                                                                                         |

## Task List

### Zoho Inventory Integration (lib)

#### Task Group 1: Inventory API Client and Sales Data

**Dependencies:** None

- [x] 1.0 Complete Zoho Inventory integration layer
  - [x] 1.1 Add Inventory base URL to Zoho config
    - In `lib/zoho/config.ts` (or equivalent), add `ZOHO_INVENTORY_BASE` env with documented default (e.g. `https://www.zohoapis.com/inventory/v1`). Do not change existing Books config or credential env vars.
    - Export inventory base for use by Inventory modules only.
  - [x] 1.2 Create `lib/zoho/inventory-items.ts`
    - Fetch items from Zoho Inventory API using existing `getZohoAccessToken()` and config (inventory base URL). Mirror pattern from `lib/zoho/books-items.ts`: result shape `{ ok, items }` or `{ ok: false, message }`; handle credential/API errors without exposing internals.
    - Map raw Inventory item fields to a minimal item type (id, name, sku, price/rate, status if API provides it).
  - [x] 1.3 Create Inventory sales-by-item (or equivalent) fetch and merge
    - Add module (e.g. `lib/zoho/inventory-reports.ts` or under existing reports pattern) that fetches sales-by-item data from Zoho Inventory (report or endpoint Inventory provides). Return rows keyed by item id or SKU with quantity_sold and amount.
    - Implement merge function: given list of items and sales rows, attach quantitySold and amount to each item by id/SKU; items missing from report keep null for those fields. Mirror `mergeSalesReportIntoProducts` pattern from `lib/zoho/reports.ts`.
  - [x] 1.4 Write 2–8 focused tests for Inventory integration
    - Test config exposes inventory base; test inventory items fetch (mocked HTTP) returns expected shape; test merge attaches quantitySold/amount by id or SKU and leaves null when missing. Do not test Zoho API live.
  - [x] 1.5 Run Inventory integration tests only
    - Run only the tests added in 1.4. Do not run full suite.

**Acceptance Criteria:**

- Config includes Inventory base URL; Books config unchanged.
- Inventory items can be fetched (in tests via mocks); merge produces items with quantitySold and amount when report has data.
- The 2–8 tests written in 1.4 pass.

**Pause for review (after Task Group 1)**

- [x] **Check:** Config has `ZOHO_INVENTORY_BASE` (or default); `lib/zoho/inventory-items.ts` and sales/merge module exist; integration tests pass.
- [x] **You:** Add `ZOHO_INVENTORY_BASE` to `.env.local` if needed; ensure refresh token has Inventory scopes; run the new tests locally.
- [x] **Resume:** Proceed to Task Group 2 when you’re satisfied.

### API Layer

#### Task Group 2: GET /api/inventory/products

**Dependencies:** Task Group 1

- [x] 2.0 Complete Inventory products API route
  - [x] 2.1 Define response type for Inventory products
    - Reuse or extend `ApiProduct` in `lib/types/product.ts` so response includes id, name, sku, price (or averagePrice), quantitySold, amount, and optional status. Use only for the new route and Products page so Books consumers stay unchanged.
  - [x] 2.2 Create `app/api/inventory/products/route.ts`
    - Implement GET handler. Accept optional `search` query param. Call Inventory items + sales-by-item (or equivalent), merge, then filter by search (name/SKU) if provided. Return JSON array of products. Follow conventions from `app/api/products/route.ts` (status codes, error JSON, no Zoho details in response).
    - On missing credentials or Zoho errors, return 503 or 502 with safe message (e.g. "Products unavailable. Please try again later.").
  - [x] 2.3 Write 2–8 focused tests for GET /api/inventory/products
    - Test successful response shape and search filtering; test error response when Zoho fails or credentials missing. Mock Inventory lib calls.
  - [x] 2.4 Run API route tests only
    - Run only the tests added in 2.3. Do not run full suite.

**Acceptance Criteria:**

- GET /api/inventory/products returns JSON array of products with required fields; search param filters by name/SKU.
- Credential/API errors return appropriate 5xx and safe message.
- The 2–8 tests written in 2.3 pass.

**Pause for review (after Task Group 2)**

- [x] **Check:** New route exists at `app/api/inventory/products/route.ts`; response type is defined; route tests pass.
- [x] **You:** Hit `GET /api/inventory/products` (and `?search=...`) manually and confirm response shape and real data if Zoho is configured.
- [x] **Resume:** Proceed to Task Group 3 when ready.

### Frontend: Products Page

#### Task Group 3: Products Page Data Source and Table

**Dependencies:** Task Group 2

- [x] 3.0 Complete Products page switch to Inventory route and column layout
  - [x] 3.1 Point Products page to new route
    - In `app/dashboard/products/page.tsx`, change fetch URL from `/api/products` to `/api/inventory/products`. Keep existing loading, error, and state handling.
  - [x] 3.2 Single Product column (name + SKU)
    - Replace separate Product and SKU columns with one column: item name on first line, SKU on second line in the same table cell. Match `planning/visuals/products-page-current.png` layout.
  - [x] 3.3 Columns: Price, Quantity Sold, Amount; Status conditional
    - Keep Price (or Average Price from API), Quantity Sold, Amount. Display "—" for null quantitySold/amount. Include Status column only if the API returns status; otherwise remove the Status column and related Badge/display. Match `planning/visuals/zoho-sales-by-item-report.png` for data alignment.
  - [x] 3.4 Preserve search, sort, and pagination
    - Keep client-side search (by name/SKU), sort (Quantity Sold, Amount), and pagination (page size 20, "Showing X–Y of Z", prev/next). No behavior change beyond data source and column layout.
  - [x] 3.5 Write 2–8 focused tests for Products page
    - Test that page calls `/api/inventory/products` on load; test that table renders single Product column with name and SKU; test search/sort/pagination still work with mocked response. Do not exhaustively test every UI state.
  - [x] 3.6 Run Products page tests only
    - Run only the tests added in 3.5. Do not run full suite.

**Acceptance Criteria:**

- Products page fetches from `/api/inventory/products`; table has one Product column (name + SKU), then Price, Quantity Sold, Amount, and Status only if API provides it.
- Search, sort, and pagination behave as before; null stats show as "—".
- The 2–8 tests written in 3.5 pass.

**Pause for review (after Task Group 3)**

- [x] **Check:** Products page uses new route; table has single Product column (name + SKU), then Price, Quantity Sold, Amount, and Status if applicable; page tests pass.
- [x] **You:** Open `/dashboard/products` in the app and verify data, columns, search, sort, and pagination.
- [x] **Resume:** Proceed to Task Group 4 when the UI looks correct.

### Testing

#### Task Group 4: Test Review and Gap Analysis

**Dependencies:** Task Groups 1–3

- [x] 4.0 Review tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1–3
    - Review tests from 1.4 (Inventory integration), 2.3 (API route), 3.5 (Products page). Total approximately 6–24 tests.
  - [x] 4.2 Identify critical gaps for this feature
    - Focus on end-to-end flow: request to `/api/inventory/products` → Products page displays data. Identify any missing integration or user workflow coverage. Do not assess whole-app coverage.
  - [x] 4.3 Add up to 10 strategic tests if needed
    - Add at most 10 tests to cover critical gaps (e.g. E2E: fetch Inventory route and assert table content; error state on page). Skip edge cases and non–business-critical scenarios.
  - [x] 4.4 Run feature-specific tests only
    - Run tests from 1.4, 2.3, 3.5, and 4.3. Total approximately 16–34 tests. Do not run full application suite.

**Acceptance Criteria:**

- All feature-specific tests pass.
- Critical user workflow (open Products page → see Inventory-sourced products with correct columns) is covered.
- No more than 10 additional tests added in 4.3.

**Pause for review (after Task Group 4)**

- [ ] **Check:** All feature-related tests (from groups 1–4) pass.
- [ ] **You:** Run the feature test set locally; optionally run the full suite and fix any regressions.
- [ ] **Done:** Feature is complete once you’re satisfied with tests and manual verification.

## Execution Order

1. **Zoho Inventory Integration** (Task Group 1) — config, inventory items, sales data, merge.  
   → **Pause:** Complete “Work you need to complete” for Group 1 and the Group 1 checkpoint before continuing.
2. **API Route** (Task Group 2) — GET /api/inventory/products and types.  
   → **Pause:** Complete the Group 2 checkpoint (manual API check) before continuing.
3. **Products Page** (Task Group 3) — fetch URL, column layout, optional Status.  
   → **Pause:** Complete the Group 3 checkpoint (manual UI check) before continuing.
4. **Test Review & Gaps** (Task Group 4) — review and optional 10 tests, then run feature tests only.  
   → **Pause:** Run feature tests and optionally full suite; mark feature done.

## Documentation

- [ ] Document that the refresh token must include Zoho Inventory scopes (e.g. in README or `agent-os/specs/2026-03-07-products-page-zoho-inventory-api-switch/implementation/`) so future setup is clear.
