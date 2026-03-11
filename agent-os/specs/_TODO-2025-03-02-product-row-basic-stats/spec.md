# Specification: Product Row Basic Stats

## Goal

Add Quantity Sold, Amount (revenue), and Average Price to each row of the Products page table, sourced from Zoho Inventory "Sales by Item" report data via API, with Zoho-style number formatting and sortable Quantity Sold and Amount columns.

## User Stories

- As an investor or founder, I want to see quantity sold, revenue, and average price per product on the Products table so that I can assess product-level performance at a glance.
- As an investor or founder, I want to sort the product list by quantity sold or amount so that I can quickly see top performers.

## Specific Requirements

**Columns and data**
- Add three new columns to the Products table: Quantity Sold, Amount, Average Price. Keep existing columns (Product, SKU, Price, Status) and their order; insert the new stats in a logical place (e.g. after Price, before Status).
- Extend the product type (or API response shape) to include quantitySold, amount, and averagePrice (or equivalent names). Use numeric types; allow null/undefined when report data is missing for a product.
- Format numbers in Zoho style: right-aligned, thousands separators (e.g. 24,210.00), two decimal places; currency with "$" (e.g. $593,227.00). Use the dashboard’s existing theme colors and typography (e.g. text-muted-foreground, text-foreground), not Zoho’s blue.

**Zoho API integration**
- Source stats from Zoho Inventory "Sales by Item" report (or equivalent). Research and use the Zoho Inventory Reports API (or the correct Reports endpoint) to fetch this data; reuse existing Zoho auth and config (getZohoAccessToken, getZohoConfig) where applicable.
- Fetch report data on page load (e.g. when the products API or a dedicated report endpoint is called) or via a scheduled/background job that stores results; implementation may choose the approach. Products API response must include the three stats per product (merged with existing item data by SKU or item id).
- If report data is unavailable (e.g. API error, no report for date range), return products with null/empty stats and show "—" or equivalent in the UI; do not block the product list.

**Sorting**
- Make Quantity Sold and Amount columns sortable by clicking the column header (asc/desc toggle). Sorting is client-side on the current page data (filtered list). No new filters (e.g. by amount range) and no server-side sort params in this iteration.

**UI scope and behavior**
- Apply changes only to the main product table on the Products page. Do not add these stats to expandable product detail or other tables. Update the expandable row colspan to match the new column count (e.g. 7 columns total).
- Preserve existing behavior: search, expand/collapse row, loading and error states. Table and Card layout, and existing styling (border-border, bg-card, status badges), remain unchanged.

**Edge cases**
- Products that appear in the item list but not in the report: show "—" for the three stats and still allow sort (treat null as smallest). When sorting by Quantity Sold or Amount, nulls sort to the end or start consistently.

## Visual Design

**`planning/visuals/zoho-sales-by-item.png`**
- Reference for column semantics: ITEM NAME, SKU, QUANTITY SOLD, AMOUNT, AVERAGE PRICE.
- Numeric columns right-aligned; comma-separated thousands; two decimals; currency with "$".
- Use this for data meaning and number format only; do not copy Zoho’s blue color or layout (use dashboard theme).

**`planning/visuals/mantra-products-current.png`**
- Current Products page: Product, SKU, Price, Status; search above; dark theme; status pills (Active/Inactive).
- Add the three new columns while keeping this layout and dashboard styling (Card, Table, text-foreground, text-muted-foreground, existing header/row styles).

## Existing Code to Leverage

**`app/dashboard/products/page.tsx`**
- Reuse the page structure (title, Card, CardContent), search Input, Table (TableHeader, TableBody, TableRow, TableCell), and expandable row logic (expandedId, row click). Add the three new columns and sortable header behavior; update colspan for the detail row to match total column count.

**`app/api/products/route.ts` and `lib/zoho/inventory.ts`**
- Products API already fetches Zoho Inventory items and maps them to ApiProduct. Extend the flow to also fetch "Sales by Item" report data (new Zoho module or endpoint), merge by item id/SKU, and return quantitySold, amount, averagePrice. Reuse getZohoAccessToken and getZohoConfig for the report request.

**`lib/types/product.ts`**
- Extend ApiProduct (or the type used by the Products page) with optional quantitySold, amount, and averagePrice so the frontend and API share one shape.

**`components/tables/top-products-table.tsx`**
- Reuse the pattern for right-aligned numeric columns (text-right), Units Sold / Revenue / Avg Price headers, and number formatting: toLocaleString() for integers and revenue, toFixed(2) for currency decimals. Apply the same formatting and alignment to the new columns on the Products page (with dashboard colors).

**`components/ui/table.tsx`**
- Continue using Table, TableHeader, TableBody, TableRow, TableHead, TableCell for the Products table; add sort state and clickable headers for Quantity Sold and Amount only.

## Out of Scope

- % of total revenue column or any percentage column (defer to later).
- Charts, sparklines, or trend arrows inside product rows.
- Export (CSV/Excel) or new filter controls (e.g. date range, amount range) on the Products page.
- Showing these stats in the expandable product detail panel or in other product tables elsewhere in the app.
- Server-side sorting or pagination for the products list.
- Changing the existing Zoho Inventory Items integration (e.g. item list, SKU, price, status) beyond merging in report data.
