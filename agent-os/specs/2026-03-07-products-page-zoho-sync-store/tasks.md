# Task Breakdown: Products Page Zoho Sync Store

## Overview

Total task groups: 5. Each group ends with a **Pause for you** checkpoint so you can verify before moving on. Some steps require **Your tasks** (Vercel dashboard, env, etc.) and are called out explicitly.

---

## Your Tasks (supplement implementation)

These are steps only you can do; the implementation will assume they are done when needed.

| When | What you need to do |
|------|---------------------|
| **Before Task Group 1** | Ensure the Supabase project has a table for synced products (or run the migration/SQL from Task 1.2). You use the **same** Supabase project already used for Auth. |
| **Before Task Group 1** | Add **service role** key for server-only access: in Supabase Dashboard → Project Settings → API, copy the `service_role` key (secret). Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and Vercel env vars. Do not expose this key to the client. |
| **Before Task Group 3** | Add a secret for cron auth: generate a random string and set `CRON_SECRET` in Vercel (Environment Variables). The cron route will expect this in a header or query param. |
| **After Task Group 3** | Configure Vercel Cron: in Dashboard (Project → Settings → Crons) or via `vercel.json` (see task 3.4), add a cron that calls the sync route on your chosen schedule (e.g. `0 * * * *` for hourly). |

---

## Task List

### Store Layer (Supabase)

#### Task Group 1: Products store (Supabase table)
**Dependencies:** None  
**Your tasks before starting:** Add `SUPABASE_SERVICE_ROLE_KEY` to env (Supabase Dashboard → Project Settings → API). Create the table via migration or SQL below if implementation provides it.

- [x] 1.0 Complete products store layer
  - [x] 1.1 Write 2–6 focused tests for store get/set behavior
    - Test: get returns empty array when table is empty
    - Test: set then get returns the same ApiProduct[] (or equivalent rows)
    - Test: full refresh overwrite (e.g. replace all rows) replaces previous data
    - Mock Supabase client so tests don’t require real DB (e.g. vi.mock or test double)
  - [x] 1.2 Define table and migration (or SQL run once)
    - Table name e.g. `synced_inventory_products` or `inventory_products`
    - Columns: id (text, primary key), name, sku, price, status, quantity_sold, amount; optional updated_at
    - Document in README or implementation: run this migration in Supabase (SQL Editor or migrations) if not using an ORM
  - [x] 1.3 Implement products store module
    - Use Supabase server client with **service role** key (new helper e.g. `createSupabaseServiceClient()` in `lib/supabase/` or similar; server-only, never expose service role to client)
    - `getProductsFromStore(): Promise<ApiProduct[]>` — select all rows, map to ApiProduct[]; return [] on error or empty
    - `setProductsInStore(products: ApiProduct[]): Promise<void>` — full refresh: delete all rows then insert all (or truncate + insert); use a transaction or two calls
    - Keep store module server-only; use existing `ApiProduct` from `lib/types/product.ts`
  - [x] 1.4 Ensure store layer tests pass
    - Run only the tests from 1.1
    - Use mocks for Supabase in tests

**Acceptance criteria**
- Store get/set tests pass.
- `getProductsFromStore()` returns `[]` when table empty or on error.
- `setProductsInStore(products)` overwrites the table; next get returns that list.
- Table lives in existing Supabase project; access via service role for cron and API route only.

---

**Pause for you:** Run the store tests, confirm Supabase table exists and `SUPABASE_SERVICE_ROLE_KEY` works locally. Then proceed to Task Group 2.

---

### Shared Zoho → ApiProduct pipeline

#### Task Group 2: Build products from Zoho (sync job only)
**Dependencies:** None (no cache dependency; this is pure Zoho → ApiProduct[]).

- [x] 2.0 Complete shared “build products from Zoho” logic
  - [x] 2.1 Write 2–6 focused tests for the pipeline
    - Test: returns [] when Zoho items fetch fails or returns no items
    - Test: maps items to ApiProduct and filters by hasValidSkuAndPrice
    - Test: merges sales report into products (quantitySold, amount) when report succeeds
    - Test: products without report rows have null quantitySold/amount
    - Mock `fetchZohoInventoryItems` and `fetchZohoInventorySalesByItemReport`
  - [x] 2.2 Extract or add `buildProductsFromZoho()` (or equivalent)
    - Live in `lib/zoho/` or `lib/inventory/` (single place, server-only)
    - Call `fetchZohoInventoryItems()` then `fetchZohoInventorySalesByItemReport()`
    - Reuse mapping: same as current route (map item → ApiProduct, filter hasValidSkuAndPrice)
    - Reuse `mergeInventorySalesReportIntoProducts()` from `lib/zoho/inventory-reports.ts`
    - Return `ApiProduct[]`; do not touch cache here
  - [x] 2.3 Ensure pipeline tests pass
    - Run only the tests from 2.1

**Acceptance criteria**
- Pipeline tests pass with Zoho calls mocked.
- `buildProductsFromZoho()` returns the same shape and filtering as current route logic; no cache or HTTP in this function.

---

**Pause for you:** Run the pipeline tests. Confirm behavior matches current products route output (you can compare with a quick manual Zoho run if desired). Then proceed to Task Group 3.

---

### Sync job (cron route)

#### Task Group 3: Cron route and store write
**Dependencies:** Task Groups 1 and 2  
**Your tasks before/after:** Set `CRON_SECRET` in Vercel; configure cron schedule (see table above).

- [x] 3.0 Complete sync job route
  - [x] 3.1 Write 2–6 focused tests for the cron route
    - Test: request without valid auth (e.g. missing or wrong CRON_SECRET) returns 401 or 403
    - Test: with valid auth, mocks for Zoho and store — route calls buildProductsFromZoho and setProductsInStore with result
    - Test: when Zoho fails, route does not overwrite store with partial data (optional: or document intended behavior)
    - Mock `buildProductsFromZoho` and store set/get
  - [x] 3.2 Create cron route (e.g. `app/api/cron/sync-inventory-products/route.ts`)
    - GET or POST; verify caller with `CRON_SECRET` (header or query param), reject unauthorized
    - Call `buildProductsFromZoho()`, then `setProductsInStore(products)`
    - Return 200 on success; 500 or 503 on failure with generic message (no Zoho/store details)
  - [x] 3.3 Document cron configuration
    - Add `vercel.json` with `crons` entry pointing to this route, or document in README that user must add cron in Vercel Dashboard (schedule e.g. hourly or daily)
  - [x] 3.4 Ensure cron route tests pass
    - Run only the tests from 3.1

**Acceptance criteria**
- Unauthorized requests are rejected; authorized request runs pipeline and writes to store.
- Cron route does not expose Zoho or store internals in responses.

---

**Pause for you:** Run cron route tests. Add `CRON_SECRET` and configure the cron in Vercel (or locally for dev). Optionally trigger the route once and confirm the Supabase table is populated. Then proceed to Task Group 4.

---

### API layer (products route)

#### Task Group 4: GET /api/inventory/products reads from store
**Dependencies:** Task Group 1 (store).

- [x] 4.0 Complete API route read-from-store behavior
  - [x] 4.1 Write 2–6 focused tests for GET /api/inventory/products
    - Test: 200 and [] when store is empty / get returns []
    - Test: 200 and full array when store has data; no Zoho calls
    - Test: search param filters by name/SKU (same as current contract)
    - Test: 503 (or appropriate) when store get throws or fails (mock store to throw)
    - Mock the store layer only; do not call Zoho
  - [x] 4.2 Change GET /api/inventory/products to read from store only
    - Replace Zoho calls with `getProductsFromStore()`
    - Apply existing search filter (by name/SKU) to stored list; same query param `search`
    - Return 200 + JSON array (ApiProduct[]); empty store → 200 + []
    - On store failure: return 503 with generic message (e.g. “Products unavailable. Please try again later.”); do not expose store details
  - [x] 4.3 Update existing route tests
    - Remove Zoho mocks; add store mocks
    - Keep tests for search filtering, response shape, and error status
  - [x] 4.4 Ensure API route tests pass
    - Run only the tests for this route (4.1 and 4.3)

**Acceptance criteria**
- GET /api/inventory/products never calls Zoho; it only reads from store and applies search.
- Empty store → 200 + []; store failure → 503 with generic message.
- Existing Products page tests (fetch URL, response shape) still pass without UI changes.

---

**Pause for you:** Run the products API tests and open the Products page; confirm it loads from the store (and shows empty or synced data as expected). Then proceed to Task Group 5.

---

### Testing

#### Task Group 5: Test review and gap analysis
**Dependencies:** Task Groups 1–4.

- [x] 5.0 Review tests and fill critical gaps only
  - [x] 5.1 Review tests from Task Groups 1–4
    - Store (1.1), pipeline (2.1), cron route (3.1), products API (4.1, 4.3)
    - Total: about 12–24 tests
  - [x] 5.2 Identify critical gaps for this feature only
    - End-to-end: cron runs → store updated → GET /api/inventory/products returns data (optional single e2e if not covered)
    - Any integration point between store, cron, and API that lacks coverage
  - [x] 5.3 Add up to 10 additional tests if needed
    - Focus on integration and critical workflows only
  - [x] 5.4 Run feature-specific tests
    - Cache, buildProductsFromZoho, cron route, GET /api/inventory/products, and Products page tests that hit this API
    - Do not run the full suite unless desired
    - Confirm: Products page test still expects `/api/inventory/products` and same response shape

**Acceptance criteria**
- All feature-related tests pass.
- Products page behavior unchanged; no new UI tasks.

---

**Pause for you:** Run the full feature-related test set. Deploy and confirm cron runs on schedule and Products page loads from the Supabase store.

---

## Execution order

1. **Your tasks:** Add `SUPABASE_SERVICE_ROLE_KEY` and create Supabase table (or run migration) when indicated; set `CRON_SECRET` and configure Vercel Cron when indicated.
2. **Task Group 1:** Store layer (Supabase table) — then **pause and check**.
3. **Task Group 2:** Build products from Zoho — then **pause and check**.
4. **Task Group 3:** Cron route — then **pause and check** (and configure cron).
5. **Task Group 4:** GET /api/inventory/products read-from-store — then **pause and check**.
6. **Task Group 5:** Test review and gaps — then **final pause and check**.

## Summary: your actions

- Add **SUPABASE_SERVICE_ROLE_KEY** (Supabase Dashboard → Project Settings → API → service_role). Create the synced-products table (migration or SQL from Task 1.2).
- Add **CRON_SECRET** and configure Vercel Cron to hit the sync route on your chosen schedule.
- Pause after each task group to run the relevant tests and, where applicable, manually verify (e.g. Products page, one-off cron trigger).
