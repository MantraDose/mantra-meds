# Specification: Products Page — Zoho Inventory API Switch

## Goal

Switch the Products page data source from Zoho Books to Zoho Inventory by introducing a new API route that calls Inventory (items + sales-by-item or equivalent), and update the Products page to consume that route and display columns aligned with the Sales by Item report. Dashboard and Performance remain on Books; one token with both scopes.

## User Stories

- As an investor, I want the Products page to show item names, SKUs, quantity sold, and revenue from Zoho Inventory so that I see inventory-centric product and sales metrics in one place.
- As a founder, I want search, sort, and pagination to keep working on the Products page after the switch so that I can find and analyze products as before.

## Specific Requirements

**New Inventory-backed API route**
- Add a dedicated route (e.g. `GET /api/inventory/products`) that is the sole data source for the Products page.
- Do not change the existing `GET /api/products` route; it continues to use Zoho Books for Dashboard/Performance and any other current callers.
- Route accepts optional `search` query param; support sort and pagination semantics expected by the current Products page (e.g. return full list and let frontend paginate, or support server-side params per project conventions).
- Call Zoho Inventory API for items list and for sales-by-item data (or equivalent report/endpoint Inventory provides).
- Use the same OAuth token as Books; ensure refresh token has both Books and Inventory scopes; reuse existing env vars (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`). Add only what is needed for Inventory base URL (e.g. env or constant for Inventory API base).
- Return JSON array of products with fields needed for the updated table: id, name, sku, price (or average price), quantitySold, amount, and status only if Inventory exposes it.
- On credential or API errors, return appropriate 5xx and a safe user-facing message; do not expose Zoho internals.

**Zoho Inventory integration**
- Introduce server-only modules (e.g. under `lib/zoho/`) for Inventory: config or base URL for Inventory API, fetch Inventory items, fetch Inventory sales-by-item (or equivalent). Mirror existing Books pattern: get access token via existing `getZohoAccessToken()`, then call Inventory endpoints with that token.
- Zoho Inventory API uses a different base path than Books; add the Inventory base URL via env (e.g. `ZOHO_INVENTORY_BASE`) or documented default so both APIs can coexist.
- Merge items with sales-by-item data by stable key (e.g. item id or SKU) so each product has quantitySold and amount when available; products missing from the report keep null/undefined for those fields.

**Products page data source and table columns**
- Change the Products page to fetch from the new Inventory route (e.g. `/api/inventory/products`) instead of `/api/products`.
- Keep one **Product** column: show item name on the first line and SKU on the second line in the same cell (no separate SKU column).
- Table columns after Product: **Price** (or Average Price, per Inventory data), **Quantity Sold**, **Amount**. Include **Status** only if the Inventory API provides it; otherwise remove the Status column and any status-only filtering/display.
- Preserve search (filter by name/SKU), sort (e.g. Quantity Sold, Amount), and pagination (e.g. page size 20, “Showing X–Y of Z”, prev/next). Behavior and UX should match current page aside from column layout and data source.

**Product type and response shape**
- Define or extend a product type for the Inventory-backed response (e.g. id, name, sku, price or averagePrice, quantitySold, amount, status?) so the frontend and route share a single contract. Reuse or adapt existing `ApiProduct`-style type if it fits; otherwise introduce an Inventory-product type and use it only for the new route and Products page.
- Ensure null/missing quantitySold and amount are displayed as “—” or equivalent in the UI; format numbers and currency consistently with the current page.

**Credentials and configuration**
- Use one Zoho refresh token with both Books and Inventory scopes; no separate Inventory client or `ZOHO_INVENTORY_*` credential env vars. Document that the refresh token must include Inventory scopes (e.g. in README or spec implementation notes).
- Keep existing Books routes and `lib/zoho` Books code unchanged; add Inventory-only code paths and route so that Books and Inventory coexist.

## Visual Design

**`planning/visuals/products-page-current.png`**
- Dark theme: card, table, search bar, pagination controls.
- Single Product column with name on first line, SKU on second line in same cell.
- Columns: Product, Price, Quantity Sold, Amount, Status (green “Active” / red “Inactive” pills).
- Search placeholder “Search products…”; pagination “Showing 1–20 of 54”, “Page 1 of 3”, prev/next buttons.
- Preserve this layout and behavior; only change data source and remove or keep Status per Inventory API.

**`planning/visuals/zoho-sales-by-item-report.png`**
- Report columns: ITEM NAME, SKU, QUANTITY SOLD, AMOUNT, AVERAGE PRICE.
- Table has numeric formatting (e.g. 24,210.00 for quantity; $593,227.00 for amount).
- No Status column in report; Status comes from Inventory item API if at all.
- Align Products page columns to this report: Product (name + SKU), then Quantity Sold, Amount, and Price or Average Price.

## Existing Code to Leverage

**`lib/zoho/config.ts` and `lib/zoho/token.ts`**
- Reuse for OAuth: same `getZohoConfig()` and `getZohoAccessToken()`; add Inventory base URL in config (or env) without duplicating client id/secret/refresh token. Token is shared across Books and Inventory.

**`lib/zoho/books-items.ts` and `lib/zoho/reports.ts`**
- Use as patterns for Inventory: separate module that fetches items and a module that fetches/aggregates sales-by-item; merge report into items by id or SKU. Do not modify Books modules; add new Inventory modules and call them from the new route only.

**`app/api/products/route.ts`**
- Reference for request/response shape and error handling (search param, 503 vs 502, JSON response). New route follows same conventions (query params, error responses) but calls Inventory and returns Inventory-shaped data.

**`app/dashboard/products/page.tsx`**
- Reuse layout, Card, Table, search state, sort state, pagination state, and formatting helpers. Change fetch URL to the new Inventory route; combine Product and SKU into one column; add or remove Status column based on API; keep search/sort/pagination logic.

**`lib/types/product.ts`**
- Reuse or extend `ApiProduct` for the new route and page if fields align (id, name, sku, price, quantitySold, amount, status); otherwise introduce an Inventory-product type used only by the new route and Products page so existing Books consumers are unchanged.

## Out of Scope

- Changing Dashboard or Performance pages to use Zoho Inventory; they continue to use Books only.
- Adding or changing the “top products” widget on the Dashboard to use Inventory (future spec).
- Using both APIs in many areas across the dashboard; limit this spec to the Products page and its new route.
- Separate Zoho Inventory OAuth client or `ZOHO_INVENTORY_*` credential env vars.
- Modifying or removing the existing `GET /api/products` route.
- Creating or editing products in Zoho from the dashboard.
- Server-side pagination in the new route unless already required by project conventions (frontend pagination is acceptable if it matches current behavior).
- Multi-currency or multi-organization handling beyond what Inventory API supports with current token.
- Syncing Inventory data into a separate database; read-only from Zoho Inventory API for this spec.
