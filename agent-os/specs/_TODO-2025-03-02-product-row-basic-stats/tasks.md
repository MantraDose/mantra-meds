# Task Breakdown: Product Row Basic Stats

## Overview

Total Tasks: 4 task groups (types/Zoho integration, API, frontend, test review). No database layer—data is sourced from Zoho Inventory report API and merged with existing items.

## Task List

### Types and Zoho Report Integration

#### Task Group 1: Product Type and Zoho Sales-by-Item Report
**Dependencies:** None

- [x] 1.0 Complete product type extension and Zoho report integration
  - [x] 1.1 Write 2–8 focused tests for report merge and type shape
    - Test merge of report rows with product items by SKU or item id (matches and misses)
    - Test that extended product shape includes quantitySold, amount, averagePrice (optional/null when missing)
    - Skip exhaustive Zoho API response shapes; mock report payload for tests
  - [x] 1.2 Extend `ApiProduct` in `lib/types/product.ts`
    - Add optional `quantitySold: number | null`, `amount: number | null`, `averagePrice: number | null`
    - Keep existing fields unchanged; document that stats come from Zoho report
  - [x] 1.3 Research Zoho Inventory Reports API for "Sales by Item"
    - Identify correct endpoint (e.g. Reports or equivalent) and response shape
    - Reuse `getZohoAccessToken` and `getZohoConfig` from `lib/zoho`; use same base URL pattern as `lib/zoho/inventory.ts`
  - [x] 1.4 Implement fetch for Sales-by-Item report data
    - New module (e.g. `lib/zoho/reports.ts`) or extend inventory with report fetch
    - Return a result type (ok + data or error + message); do not throw into API route
  - [x] 1.5 Implement merge of report data with product items
    - Match report rows to items by item id or SKU; attach quantitySold, amount, averagePrice to each product
    - Products not in report get null for the three stats; product list still returns all items
  - [x] 1.6 Ensure types and merge tests pass
    - Run ONLY the 2–8 tests written in 1.1
    - Verify merge logic and type shape; do NOT run full suite

**Acceptance Criteria:**
- ApiProduct includes optional quantitySold, amount, averagePrice
- Zoho Sales-by-Item report is fetched using existing auth/config
- Merge by SKU or item id produces products with stats or nulls
- The 2–8 tests from 1.1 pass

### API Layer

#### Task Group 2: Products API with Stats
**Dependencies:** Task Group 1

- [x] 2.0 Complete products API with report stats
  - [x] 2.1 Write 2–8 focused tests for GET /api/products with stats
    - Test response includes quantitySold, amount, averagePrice when report data exists
    - Test when report fetch fails or is unconfigured: products still returned with null stats (no 5xx for product list)
    - Test existing behavior: search param, product shape (id, name, sku, price, status) unchanged
  - [x] 2.2 Extend GET /api/products in `app/api/products/route.ts`
    - After fetching inventory items, fetch Sales-by-Item report (from Task 1.4)
    - Merge report data with items using merge logic from Task 1.5; map to extended ApiProduct
  - [x] 2.3 Handle report unavailable gracefully
    - On report API error or missing config: return products with null quantitySold, amount, averagePrice; do not fail the whole request
  - [x] 2.4 Keep response shape and status codes consistent
    - 200 with array of extended ApiProduct; existing 502/503 for inventory fetch failure unchanged
  - [x] 2.5 Ensure API layer tests pass
    - Run ONLY the 2–8 tests written in 2.1
    - Do NOT run entire test suite

**Acceptance Criteria:**
- GET /api/products returns products with quantitySold, amount, averagePrice (or null)
- Report failure does not block product list; stats are null
- Existing search and product fields unchanged; tests from 2.1 pass

### Frontend

#### Task Group 3: Products Table Columns and Sorting
**Dependencies:** Task Group 2

- [x] 3.0 Complete Products page table with stats columns and sorting
  - [x] 3.1 Write 2–8 focused tests for products table UI
    - Test that table renders Quantity Sold, Amount, Average Price columns with formatted values or "—"
    - Test sort by Quantity Sold and Amount (asc/desc); nulls handled consistently (e.g. at end)
    - Test expandable row still works; colspan matches column count (7)
  - [x] 3.2 Add three columns to the Products table in `app/dashboard/products/page.tsx`
    - Insert after Price, before Status: Quantity Sold, Amount, Average Price
    - Use `TableHead`/`TableCell`; right-align numeric columns (`text-right`); reuse styles from `components/tables/top-products-table.tsx` (text-muted-foreground, etc.)
  - [x] 3.3 Format numeric values (Zoho-style, dashboard theme)
    - Quantity Sold: toLocaleString with two decimals (e.g. 24,210.00); show "—" when null
    - Amount: "$" + toLocaleString with two decimals (e.g. $593,227.00); "—" when null
    - Average Price: "$" + toFixed(2); "—" when null
  - [x] 3.4 Implement sortable Quantity Sold and Amount headers
    - Client-side sort state (column + direction); click header to toggle asc/desc
    - Sort filtered list only; nulls sort to one end consistently (e.g. always last when ascending)
  - [x] 3.5 Update expandable row colspan
    - Set detail row `TableCell colSpan` to 7 (Product, SKU, Price, Qty Sold, Amount, Avg Price, Status)
  - [x] 3.6 Preserve existing behavior and styling
    - Search, loading, error, expand/collapse unchanged; Card/Table layout and border-border, bg-card, status badges unchanged
  - [x] 3.7 Ensure frontend tests pass
    - Run ONLY the 2–8 tests written in 3.1
    - Do NOT run entire test suite

**Acceptance Criteria:**
- Table shows Quantity Sold, Amount, Average Price with correct formatting and "—" for nulls
- Quantity Sold and Amount are sortable via header click; nulls handled consistently
- Expandable row uses colspan 7; search and expand still work; tests from 3.1 pass

### Testing

#### Task Group 4: Test Review and Gap Analysis
**Dependencies:** Task Groups 1–3

- [ ] 4.0 Review feature tests and fill critical gaps only
  - [ ] 4.1 Review tests from Task Groups 1–3
    - Review tests from 1.1 (merge/type), 2.1 (API), 3.1 (table/sort)
    - Total existing: approximately 6–24 tests
  - [ ] 4.2 Analyze coverage gaps for this feature only
    - Focus on: API returns stats → table displays them; sort and null behavior; report failure → null stats
    - Do NOT assess full application coverage
  - [ ] 4.3 Add up to 10 additional strategic tests if needed
    - E2E or integration: load products page, see stats columns; sort; optional: mock API with report failure
    - Do NOT add exhaustive edge-case or accessibility tests unless critical
  - [ ] 4.4 Run feature-specific tests only
    - Run only tests for this spec (1.1, 2.1, 3.1, and any from 4.3)
    - Expected total: approximately 16–34 tests; do NOT run full suite

**Acceptance Criteria:**
- All feature-specific tests pass (approx. 16–34 total)
- Critical flows covered: stats in API and table, sorting, null/report-failure behavior
- No more than 10 extra tests added for gaps

## Execution Order

Recommended sequence:

1. **Types and Zoho Report** (Task Group 1) — type extension, report fetch, merge logic
2. **API Layer** (Task Group 2) — wire report into GET /api/products, graceful fallback
3. **Frontend** (Task Group 3) — columns, formatting, sortable headers, colspan
4. **Test Review** (Task Group 4) — review, gap analysis, run feature tests only

## Visual Reference

- Column order and formatting: `planning/visuals/zoho-sales-by-item.png`
- Layout and theme: `planning/visuals/mantra-products-current.png`
