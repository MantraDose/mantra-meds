# Specification: Zoho Books Data Source

## Goal

Migrate the Products page data source from Zoho Inventory to Zoho Books so the dashboard reads items and sales-by-item stats from Books APIs, and remove the average price column from the product table. Refresh token is already Books-scoped; implementation replaces Inventory code with Books API integration only.

## User Stories

- As an investor or founder, I want the Products page to show the same product list and sales stats (quantity sold, revenue) sourced from Zoho Books so that the dashboard reflects our accounting source of truth.
- As an admin, I want all Zoho Inventory–specific code removed and the app to use only Zoho Books APIs so that we maintain a single integration and env configuration.

## Specific Requirements

**Zoho config and base URL**

- Keep existing env vars: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` (refresh token already updated to Books). No new env var names.
- In server config, switch API base from Inventory base (e.g. `https://www.zohoapis.com`) to Books base: `https://www.zohoapis.com/books/v3` (or equivalent per Zoho Books docs). Support optional `ZOHO_ORGANIZATION_ID` if Books requires it for multi-org; reuse same pattern as current config.
- Token refresh (accounts.zoho.com OAuth) is unchanged; only the API base used for data calls changes to Books.

**Zoho Books Items API**

- Replace Inventory “List items” with Zoho Books Items API (e.g. list items endpoint under Books v3). Call using same auth (access token from existing refresh flow) and Books base URL.
- Map Books item response to the same product shape used today: id, name, sku, price (rate), status (active/inactive). Handle Books response structure (e.g. `item_id` or `item_id`, name, sku, rate, status) and normalize to `ApiProduct`-compatible fields.
- Return a result type equivalent to current `ZohoItemsResult | ZohoItemsError` (ok, items or ok false, message). Do not expose raw Zoho errors or credentials to callers.

**Zoho Books sales-by-item data**

- Replace Inventory “Sales by Item” report with Books-derived sales data. Options: use Books Invoices API to aggregate line items by product (item_id/sku), or use a Books report endpoint if one exists for sales by item. Prefer a single report-style endpoint if available; otherwise aggregate from invoice line items.
- Produce rows that can be matched to products by item_id or sku, with quantity_sold and amount (revenue). Average price is no longer required in the merge output.
- Keep the same merge pattern: match report rows to products by item_id or sku; products not in the report keep null for quantitySold and amount. Remove averagePrice from merge output and from any shared types used by the API response.

**Products API route**

- GET `/api/products` continues to accept optional `search` query param and return a JSON array of products. Flow: fetch items from Books, map to products, fetch/aggregate sales-by-item data from Books, merge into products, filter by search, return. Replace all calls to Inventory modules with Books modules.
- Preserve response shape for frontend: id, name, sku, price, status, quantitySold, amount. Omit averagePrice from the API response (and from type if defined in a shared product type).
- Preserve error behavior: 503 when credentials not configured or missing, 502 on Books API failure; generic user-facing message only, no Zoho internals.

**Product type and merge**

- Update shared product type (e.g. `ApiProduct`) to remove averagePrice so the API and frontend no longer depend on it. Ensure merge/sales logic does not set or reference averagePrice.
- Keep quantitySold and amount as optional/nullable for products without sales data.

**Products page table**

- Remove the Average Price column from the Products page table: remove the column header and the table cell that displays average price. Keep columns: Product, SKU, Price, Quantity Sold, Amount, Status.
- Remove any formatAveragePrice (or equivalent) usage and sort/display logic that references averagePrice. Update PRODUCT_TABLE_COLUMNS or equivalent if it is used for layout/accessibility.
- Retain search, sort (e.g. by quantitySold, amount), and pagination behavior unchanged.

**Remove Inventory-specific code**

- Delete or replace `lib/zoho/inventory.ts` (Inventory items fetch). Replace with a Books items module that implements the same contract (result shape) for the route to call.
- Delete or replace Inventory reports usage in `lib/zoho/reports.ts`: remove Inventory report path and implement Books-based sales-by-item fetch (and optionally keep merge function in the same file or move to a Books-specific module). Remove averagePrice from merge result and from SalesByItemRow if it is no longer needed.
- Update `lib/zoho/config.ts` so the exported base URL (or equivalent) points to Books API base; remove or rename references to “inventory” in config (e.g. inventoryBase → booksBase or apiBase). Keep token and env validation as-is.
- Ensure no remaining imports or references to Zoho Inventory endpoints or inventory-specific env vars. Token module stays; it is product-agnostic.

**Documentation**

- Update README (or spec/implementation docs) to state that the Products integration uses Zoho Books. Document required Books OAuth scope (e.g. ZohoBooks.fullaccess.all or ZohoBooks.settings.READ,ZohoBooks.invoices.READ) and that the refresh token must be generated with that scope. No need to document new env var names.

**Tests**

- Update API route tests: remove mocks of Inventory fetch; mock Books items and Books sales-by-item (or invoice aggregate). Remove assertions on averagePrice in API response. Keep tests for 200 with products, 502/503 on failure, search filtering, and that credentials/raw errors are not exposed.
- Update Products page tests: remove expectations for an Average Price column or averagePrice in data. Adjust column count or header assertions as needed.
- Update any unit tests for merge/reports logic to drop averagePrice from expected output and from test data.

## Existing Code to Leverage

`**lib/zoho/config.ts`**

- Reuse env validation and getZohoConfig shape; add or rename a config field for Books API base URL and use it for all Books API calls. Keep clientId, clientSecret, refreshToken, redirectUri, accountsBase unchanged.

`**lib/zoho/token.ts**`

- Reuse as-is; token refresh is shared across Zoho products. No code changes required unless config key names change; then update only the import of config.

`**app/api/products/route.ts**`

- Reuse request/response contract (GET, optional search, JSON array), error status codes (503/502), and filterBySearch/hasValidSkuAndPrice logic. Replace fetchZohoInventoryItems with Books items fetch and fetchZohoSalesByItemReport with Books sales-by-item (or invoice aggregate); replace mergeSalesReportIntoProducts with a merge that does not set averagePrice.

`**app/dashboard/products/page.tsx**`

- Reuse page layout, Card, Table, search input, loading/error state, sort by quantitySold/amount, and pagination. Remove Average Price header and cell, formatAveragePrice, and any reference to product.averagePrice. Update PRODUCT_TABLE_COLUMNS if it reflects column count.

`**lib/types/product.ts**`

- Reuse ApiProduct shape but remove averagePrice; keep id, name, sku, price, status, quantitySold, amount.

## Out of Scope

- Dashboard or org-level financial well-being widgets, P&L summary, revenue trends, or any new page for financials.
- Adding or editing data in Zoho (read-only from Books API).
- Syncing Books data into a database; data is fetched on demand from the API.
- Feature flag or configuration to switch between Inventory and Books; full cutover only.
- Multi-currency or multi-organization UI or special handling beyond optional organization_id in config.
- New env vars (e.g. ZOHO_BOOKS_*); only the refresh token value and in-code API base change.
- Changes to the top-products table on the dashboard (separate component); only the main Products page table is in scope.
- Average price column or averagePrice in API/type/UI anywhere in the Products flow.

