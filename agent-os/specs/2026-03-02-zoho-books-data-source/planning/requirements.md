# Spec Requirements: Zoho Books Data Source

## Initial Description

Yes, let's switch data sources from Inventory to Books. This should provide the item/sales data we need + the financials for general organizational 'well-being' data.

## Requirements Discussion

### First Round Questions

**Q1:** Should the Products page continue to show the same kind of data (product list plus sales-by-item stats: quantity sold, revenue, average price) but sourced from Zoho Books APIs instead of Inventory, with no change to the current UI/behavior from the user's perspective?

**Answer:** Yes, the products page should show the same kind of data without a change to the UI behavior. Also, remove the 'average price' column in the product table.

**Q2:** For "financials for general organizational well-being," which of these do you want in scope for this spec: high-level P&L or profit summary, cash/bank balance or runway-style metric, revenue trends (e.g. monthly/YTD), invoices outstanding/overdue/aging summary, or something else?

**Answer:** High-level P&L and revenue trends are probably the most relevant data.

**Q3:** Where should this well-being/financial data live—only on the existing dashboard overview (e.g. new or updated widgets), a dedicated "Financials" or "Well-being" page, or both?

**Answer:** "Well-being" was just an expression—I meant the company's financial well-being. Don't worry about the financial stuff yet. Use this migration to finish populating the products page with items and stats. We can work on org-level things later.

**Q4:** Should we assume the same Zoho account but a new Books API client (new Client ID/Secret and a Books refresh token), with Books-specific env vars (e.g. ZOHO_BOOKS_* or repurposed ZOHO_*)?

**Answer:** Same Zoho account; keep existing env var names and get a new refresh token with Books scopes (no Books-specific env vars). Refresh token has already been replaced with the Books-scoped one.

**Q5:** Should this spec include fully removing Zoho Inventory–specific code and env vars once Books is working, or keep Inventory code behind a feature flag/config so both can be toggled for a while?

**Answer:** Remove the inventory-specific code and use Books-specific code.

**Q6:** What should we explicitly leave out of scope for this spec (e.g. multi-currency, multi-org, editing data in Zoho, syncing into our own DB)?

**Answer:** Start by working on the products page first. We can use the new Books data to re-populate the page.

### Existing Code to Reference

**Similar Features Identified:**

- **Zoho integration (to be replaced):** `lib/zoho/` — config, token refresh, inventory items fetch, sales-by-item reports. Replace with Books equivalents (Items API, sales-by-item report).
- **Products API:** `app/api/products/route.ts` — calls `fetchZohoInventoryItems` and `fetchZohoSalesByItemReport`, maps to products, merges report rows. Update to call Books items + report endpoints and preserve same response shape for the frontend.
- **Products page / table:** Existing Products page and table components that consume `/api/products`; keep same UI behavior but remove the average price column from the product table.

### Follow-up Questions

None asked; scope was clear from first-round answers.

## Visual Assets

### Files Provided:

No visual assets provided. (Bash check: no image files in `planning/visuals/`.)

### Visual Insights:

N/A.

## Requirements Summary

### Functional Requirements

- Switch data source from Zoho Inventory to Zoho Books for the Products page.
- Products page continues to show product list plus sales-by-item stats (quantity sold, revenue) with no other UI behavior change.
- Remove the average price column from the product table.
- Use same Zoho account; keep existing env var names (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`). Refresh token has been replaced with a Books-scoped token (no Books-specific env vars).
- Remove all Zoho Inventory–specific code and env vars; use only Books-specific code and config.
- Re-populate the Products page using Zoho Books Items API and Books sales-by-item (or equivalent) report data.

### Reusability Opportunities

- Reuse existing `lib/zoho` structure: config, token refresh pattern, and error handling; replace Inventory endpoints with Books API endpoints and response mapping.
- Reuse `app/api/products/route.ts` request/response contract and search filtering; swap backend calls to Books.
- Reuse Products page and table components; remove average price column from table definition and any related types/stats display.

### Scope Boundaries

**In Scope:**

- Migrate Products page data source from Zoho Inventory to Zoho Books.
- Books Items API integration (list items: id, name, sku, status, rate).
- Books sales-by-item (or equivalent) report integration for quantity sold and revenue per item.
- Books-specific OAuth scopes and refresh token (already updated to Books). Remove Inventory-specific code. Keep existing env var names; only the refresh token value and API base URL in code change.
- Remove average price column from the product table and related stats (e.g. Product type, API response).
- Products API and Products page working end-to-end with Books as sole source.

**Out of Scope:**

- Dashboard/financial well-being widgets, P&L summary, revenue trends, or org-level financial views (deferred to later).
- Multi-currency, multi-org, or editing data in Zoho.
- Syncing Books data into our own database (read-only from Books API for this spec).
- Feature flag or toggling between Inventory and Books (full cutover only).

### Technical Considerations

- Zoho Books API uses v3 and different base paths than Inventory (e.g. `https://www.zohoapis.com/books/v3/`). Same env vars; refresh token already updated to Books. Document scope and token setup in README or spec docs for future reference.
- Existing code references: `lib/zoho/config.ts`, `lib/zoho/token.ts`, `lib/zoho/inventory.ts`, `lib/zoho/reports.ts`, `app/api/products/route.ts`, and product table/types that include average price.
- Document Books setup (API Console, scopes, refresh token) in README or spec docs.
- Preserve API response shape for products (id, name, sku, price, status, quantitySold, amount) so frontend changes are limited to removing average price column and any avg-price display.

- OAuth: refresh token already replaced with Books-scoped token. Scope can be ZohoBooks.fullaccess.all (all Books data) or minimal ZohoBooks.settings.READ,ZohoBooks.invoices.READ (items plus invoices).
