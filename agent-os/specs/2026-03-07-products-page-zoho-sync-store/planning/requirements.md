# Spec Requirements: Products Page Zoho Sync Store

## Initial Description

We want to stop building Products page data on every request from Zoho. Instead, introduce a server-side dataset that we own: a background job runs on a schedule (e.g. hourly or daily), fetches Zoho Inventory items and invoices, aggregates sales by item (quantity sold and amount), and writes/updates rows in our own store (DB table or cache). The Products page (and GET /api/inventory/products) should then read from this store only—no Zoho calls on page load. Scope is: design and implement the store, the scheduled sync job, and the API + UI integration so the existing Products page keeps the same behavior but is backed by the synced dataset. Out of scope for this spec: changing how often we sync or adding more Zoho sources; we can expand later.

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming we introduce a database table (e.g. Postgres) for the synced products dataset for durable storage and querying, or do you prefer a cache (e.g. Vercel KV / Redis) with a single blob or key-per-product for now?
**Answer:** Let's use a cache.

**Q2:** I'm assuming we use Vercel Cron (or a Next.js route invoked by Vercel Cron) so the job runs on the same stack. Is that correct, or do you want an external scheduler (e.g. GitHub Actions, separate worker)?
**Answer:** Let's use Vercel.

**Q3:** The sync job would call the same Zoho helpers (fetchZohoInventoryItems, fetchZohoInventorySalesByItemReport, mergeInventorySalesReportIntoProducts) and write the result into our store. Should we keep this aggregation logic in one place (shared by the sync job only; the API route would not call Zoho at all)?
**Answer:** Yes, reuse.

**Q4:** I'm assuming GET /api/inventory/products keeps the same contract (optional ?search=, same ApiProduct[] shape) so the existing Products page needs no UI or client changes. Confirm?
**Answer:** Same contract.

**Q5:** When the store is empty (e.g. first deploy, or before the first successful sync), should the API return 200 with an empty array [], or something else (e.g. 503 until first sync)?
**Answer:** 200 with [].

**Q6:** I'm assuming each job run does a full refresh: fetch all items + report from Zoho, then overwrite/upsert our store so it matches Zoho (no incremental sync in scope). Correct?
**Answer:** Full refresh.

**Q7:** Beyond sync frequency and more Zoho sources, is there anything else we should explicitly leave out of this spec (e.g. manual "Sync now" trigger, admin UI for sync status, or retry/backoff behavior)?
**Answer:** Leave out: manual sync, admin UI, retry/backoff.

### Existing Code to Reference

No similar existing features identified for reference (user did not provide paths). Implementation should reference existing Zoho and API route code: `lib/zoho/inventory-items.ts`, `lib/zoho/inventory-reports.ts`, `app/api/inventory/products/route.ts`, `lib/types/product.ts`.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A — no visuals to analyze.

## Requirements Summary

### Functional Requirements

- **Store:** Use the **existing Supabase project** (same as Auth). Add a **Postgres table** (e.g. `synced_inventory_products` or `inventory_products`) to hold the synced products dataset. Columns align with ApiProduct; full refresh = replace all rows each sync. Expose getProductsFromStore / setProductsInStore using Supabase **service role** client (server-only). When table is empty or read fails, return [].
- **Scheduled sync job:** Run on a schedule via Vercel Cron. Each run: (1) fetch Zoho Inventory items via existing `fetchZohoInventoryItems`, (2) fetch sales report via `fetchZohoInventorySalesByItemReport`, (3) aggregate using existing `mergeInventorySalesReportIntoProducts` (and existing mapping/filter logic), (4) overwrite the **store** (Supabase table: replace all rows) with the result. Full refresh only; no incremental sync.
- **API:** GET /api/inventory/products reads only from the **store** (Supabase table). Same contract: optional `?search=` (filter by name/SKU), response shape `ApiProduct[]`. When store is empty, return 200 with `[]`. No Zoho calls on request.
- **UI:** Products page and client unchanged; continues to call GET /api/inventory/products with same behavior (loading, error, search, sort, pagination).

### Reusability Opportunities

- Reuse existing Zoho helpers: `fetchZohoInventoryItems`, `fetchZohoInventorySalesByItemReport`, `mergeInventorySalesReportIntoProducts` from `lib/zoho/`. Reuse mapping/filter logic (e.g. `mapZohoInventoryItemToProduct`, `hasValidSkuAndPrice`, `filterBySearch`) or equivalent in the sync job; API reads from cache only.
- Keep `ApiProduct` and `lib/types/product.ts` as the single response type.
- Reference existing route and tests: `app/api/inventory/products/route.ts`, `app/api/inventory/products/route.test.ts`, `app/dashboard/products/page.tsx`.

### Scope Boundaries

**In Scope:**

- Design and implement the **store** (Supabase table: schema, get/set abstraction, write from job, read from API).
- Implement the scheduled sync job (Vercel Cron–invoked route or equivalent) that fetches Zoho items + sales report, aggregates, and writes to the **Supabase store**. Change GET /api/inventory/products to read from store only; preserve response contract and empty-store behavior (200 + []).
- Ensure existing Products page keeps the same behavior (no UI changes).

**Out of Scope:**

- Changing how often we sync or adding more Zoho sources (expand later).
- Manual "Sync now" trigger.
- Admin UI for sync status.
- Retry/backoff behavior for the sync job (out of scope for this spec).

### Technical Considerations

- **Cache:** Use **Supabase Postgres** (existing project). Add one table for synced products; define columns matching ApiProduct; full refresh overwrites all rows. Use **service role** key for server-only cron and API access.
- **Cron:** Vercel Cron (or Next.js route called by Vercel Cron) so the job runs on the same stack.
- **Single source of aggregation logic:** Zoho fetch + merge logic lives in existing lib; sync job calls it and writes to store; API does not call Zoho.
- **Existing system:** Products page already uses GET /api/inventory/products and ApiProduct; no client or type changes required beyond API reading from store.
