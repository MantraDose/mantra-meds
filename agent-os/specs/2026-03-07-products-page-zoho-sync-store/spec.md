# Specification: Products Page Zoho Sync Store

## Goal

Stop building Products page data on every request from Zoho by introducing a server-side **store** that we own. A scheduled job fetches Zoho Inventory items and invoices, aggregates sales by item, and writes the result to the store; GET /api/inventory/products and the Products page then read from the store only, with no Zoho calls on page load.

## User Stories

- As an investor or founder, I want the Products page to load quickly and reliably so that I can view product-level performance without depending on Zoho’s availability on each visit.
- As a system operator, I want product data to be refreshed on a schedule (e.g. hourly or daily) so that the dashboard shows up-to-date data without hitting Zoho on every request.

## Specific Requirements

**Store (Supabase)**
- Use the **existing Supabase project** (already used for Auth). Add a **Postgres table** to hold the synced products dataset (e.g. `synced_inventory_products` or `inventory_products`).
- Table columns align with ApiProduct: id (primary key), name, sku, price, status, quantity_sold, amount (and optionally updated_at). Single table; full refresh = replace all rows each sync (e.g. delete all then insert, or truncate + insert).
- Expose a small abstraction (e.g. getProductsFromStore / setProductsInStore) so the sync job writes and the API route reads; no Zoho calls in the read path. Use Supabase server client with **service role** key for server-only cron and API route access (no user session).
- When the table is empty or read fails, readers treat it as an empty list (API returns 200 with []).

**Scheduled sync job**
- Run the sync on a schedule via Vercel Cron (e.g. cron property in vercel.json or Vercel dashboard) invoking a dedicated Next.js API route (e.g. GET or POST /api/cron/sync-inventory-products or similar).
- Secure the cron route so only Vercel Cron (or the platform’s cron runner) can call it (e.g. CRON_SECRET or Vercel’s Authorization header).
- Each run: (1) fetch items with fetchZohoInventoryItems, (2) fetch sales report with fetchZohoInventorySalesByItemReport, (3) map items to ApiProduct, filter by hasValidSkuAndPrice, merge report with mergeInventorySalesReportIntoProducts, (4) overwrite the store with the resulting array (e.g. replace all rows in the Supabase table). Full refresh only; no incremental sync.
- Do not change how often the job runs or add more Zoho sources in this spec; schedule can be fixed (e.g. hourly or daily) and expanded later.

**GET /api/inventory/products**
- Read only from the store (Supabase table). Do not call any Zoho APIs in this route.
- Keep the same contract: optional query param `search` (filter by name/SKU), response body JSON array of ApiProduct, same status and headers behavior.
- When the table is empty or read fails, return 200 with body [] (treat empty as success).
- If the store client fails (e.g. connection error), return an appropriate error response (e.g. 503) with a generic message; do not expose store implementation details.

**Products page and UI**
- Leave the Products page and all client code unchanged. It continues to call GET /api/inventory/products; loading, error, search, sort, and pagination behavior stay the same.
- No changes to ApiProduct or lib/types/product.ts beyond any comments that reflect the new data source (Supabase store).

**Reuse of Zoho and mapping logic**
- Sync job reuses fetchZohoInventoryItems and fetchZohoInventorySalesByItemReport from lib/zoho (inventory-items, inventory-reports).
- Reuse mergeInventorySalesReportIntoProducts and the same mapping/filter rules as the current route: map Zoho item to ApiProduct, filter hasValidSkuAndPrice, then merge report. Extract shared logic into a single place (e.g. a function that returns ApiProduct[] from Zoho) used only by the sync job; the API route does not call this.
- Keep ApiProduct as the single response type for the products API.

**Tests and verification**
- Update or add tests for GET /api/inventory/products so they assert read-from-store behavior: 200 with [] when table empty, 200 with filtered array when store has data and search is applied, and error path when store read fails (if applicable). Mock the store layer; do not call Zoho in tests.
- Add tests for the sync job route: authorized cron request runs the pipeline and updates the store; unauthorized request is rejected. Mock Zoho and store.
- Existing Products page tests that assert fetch URL and response shape continue to pass without change.

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**lib/zoho/inventory-items.ts**
- Use fetchZohoInventoryItems() in the sync job to fetch all Zoho Inventory items; keep server-only usage.

**lib/zoho/inventory-reports.ts**
- Use fetchZohoInventorySalesByItemReport() and mergeInventorySalesReportIntoProducts() in the sync job to get and merge sales-by-item data; reuse existing types (e.g. InventorySalesByItemRow, ItemWithIdAndSku).

**app/api/inventory/products/route.ts**
- Reuse or extract mapping and filter logic: mapZohoInventoryItemToProduct, hasValidSkuAndPrice, filterBySearch (or equivalent). Sync job produces the same ApiProduct[] shape; API route only reads from store and applies search filter.

**lib/types/product.ts**
- Keep ApiProduct as the single type for the products API response and for the stored payload; no structural changes.

**app/api/inventory/products/route.test.ts**
- Follow existing patterns for mocking and asserting status/body; adapt to mock store instead of Zoho and assert empty-array and search behavior.

## Out of Scope

- Changing sync frequency or adding more Zoho data sources; expand later.
- Manual “Sync now” trigger or button.
- Admin UI for sync status or last-run time.
- Retry/backoff or advanced error handling for the sync job.
- Any change to the Products page UI or client-side behavior.
- Exposing store implementation details or table names in API responses or errors.
- Adding Vercel KV or another cache service; use Supabase as the store for this spec.
