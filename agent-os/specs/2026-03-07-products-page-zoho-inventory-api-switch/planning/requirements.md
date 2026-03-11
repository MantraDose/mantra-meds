# Spec Requirements: Products Page — Zoho Inventory API Switch

## Initial Description

Although we'll still be using the Books api for the dashboard and performance pages, I've realized that the Zoho Inventory api should be a better data-source for our Products page than the Books api.

Let's plan out the api switch for that page. Eventually (if it's advisable) we can use both apis in many areas around the dashboard.

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming only the **Products page** should use Zoho Inventory as its data source, and Dashboard and Performance continue to use the Books API only. Is that correct, or do you want any other page or widget to use Inventory in this spec?

**Answer:** There's a list of the 'top products' on the dashboard page which should presumably use the inventory api, like the products page. But, I'd like to keep the scope of work to the products page just to simplify the task. We can work on the dashboard in a future spec.

**Q2:** The current Products table has: Product, SKU, Price, Quantity Sold, Amount, Status. Should we keep this set and map Zoho Inventory (and any Inventory "sales by item"–style data) to these columns, or are you open to adding/removing columns to better match what Inventory provides?

**Answer:** If possible, I'd like to use the same column with the Item Name and the SKU underneath it. Then, let's match the columns shown in the 'Sales by Item' report from the attached screenshot.

**Q3:** The current UI shows Quantity Sold and Amount as "-". Should this spec include populating those from Zoho Inventory (e.g. a report or aggregated sales data), or switch to Inventory for product master only first and add sales metrics in a later spec?

**Answer:** We need to set up the sales metrics in this spec.

**Q4:** I'm assuming we keep the current behavior (search, sortable columns, pagination "Showing 1–20 of 54") and only change the backend to Zoho Inventory. Confirm?

**Answer:** Confirmed, keep search sort and pagination.

**Q5:** Should Active/Inactive come from Zoho Inventory (if it exposes status), or do we derive it (e.g. from stock/availability) or keep current logic if it's already defined elsewhere?

**Answer:** If we can stick to the single api, let's get the status from the inventory api. If the information doesn't exist in the inventory api, let's get rid of the column altogether.

**Q6:** Should we (a) add a new API route that calls Zoho Inventory and have the Products page call that instead of the current one, or (b) change the existing products route to call Zoho Inventory instead of Books, keeping the same URL and response shape for the frontend?

**Answer:** Let's go with option A.

**Q7:** Should we use a separate Zoho "Inventory" client/refresh token (and env vars like `ZOHO_INVENTORY_*`), or the same Zoho account with one token that has both Books and Inventory scopes and reuse existing env var names where possible?

**Answer:** Let's use one token with both scopes.

**Q8:** For this spec, should we leave "using both APIs in many areas around the dashboard" entirely out of scope and only deliver the Products-page switch to Inventory, with dual-API strategy as a later, separate decision?

**Answer:** Correct, let's stick with the Products page for now.

### Existing Code to Reference

No similar existing features explicitly identified in answers. Spec-writer should reference:

- **Products API (Books):** `app/api/products/route.ts` and related `lib/zoho` Books integration — for contrast; new route will call Inventory instead.
- **Products page:** `app/dashboard/products/page.tsx` — update to call new Inventory-backed route; adjust columns per requirements (single Product column with name + SKU, Sales by Item–style columns).
- **Prior specs:** `agent-os/specs/2026-02-27-products-page-zoho-data`, `agent-os/specs/2026-03-02-zoho-books-data-source` — for Zoho setup, product type evolution, and Books vs Inventory context.

### Follow-up Questions

None asked; scope and answers were clear.

## Visual Assets

### Files Provided:

- `products-page-current.png`: Current Products page (dark theme) with table columns Product (name + SKU in same cell), Price, Quantity Sold, Amount, Status; search bar; pagination "Showing 1-20 of 54", "Page 1 of 3". Status pills (Active green, Inactive red). Quantity Sold and Amount currently show "-".
- `zoho-sales-by-item-report.png`: Zoho "Sales by Item" report with columns ITEM NAME, SKU, QUANTITY SOLD, AMOUNT, AVERAGE PRICE; date range "From 01 Jan 2025 TO 31 Dec 2025"; numeric totals (Total Count 44, QUANTITY SOLD 109,296.00, AMOUNT $2,053,403.85). No Status column in report.

### Visual Insights:

- Product column already uses combined layout (item name on first line, SKU underneath) in the current UI; requirement is to keep this and align remaining columns with the Sales by Item report (quantity sold, amount, and optionally average price).
- Sales by Item report does not include Status; status will come from Inventory item API if available, else column is removed.
- Search, sort, and pagination patterns are to be preserved.
- Fidelity: reference screenshots of current dashboard and Zoho report; implementation should follow existing app styling and match report data structure.

## Requirements Summary

### Functional Requirements

- **Scope:** Switch only the **Products page** to Zoho Inventory as its data source. Dashboard and Performance remain on Books API. Dashboard "top products" may use Inventory in a future spec; out of scope here.
- **New API route (Option A):** Add a dedicated route that calls Zoho Inventory (e.g. `/api/inventory/products` or similar); Products page calls this new route instead of the existing Books-backed `/api/products`.
- **Table columns:** One **Product** column with Item Name and SKU underneath (same as current). Remaining columns match the "Sales by Item" report: **Quantity Sold**, **Amount**, and optionally **Average Price** (or **Price**). Include **Status** only if provided by Zoho Inventory API; otherwise remove the Status column.
- **Sales metrics:** Populate Quantity Sold and Amount (and average/price as chosen) from Zoho Inventory—e.g. Sales by Item report or equivalent Inventory API—in this spec.
- **Search, sort, pagination:** Keep current behavior; backend supports search, sort, and pagination for the new Inventory-sourced data.
- **Credentials:** One Zoho token with both Books and Inventory scopes; reuse existing env var names (no separate `ZOHO_INVENTORY_*`).

### Reusability Opportunities

- Reuse Products page layout, search, sort, and pagination UI; change data source to new Inventory route and adjust column definitions to match Sales by Item + status-if-available.
- Reuse or mirror existing `lib/zoho` patterns (config, token refresh) for Inventory API base URL and endpoints; add Inventory-specific fetch logic (items + sales-by-item or equivalent) in the new route.
- Reference existing Books products route and response shape only for contrast; new route has its own response shape aligned to Inventory + Sales by Item fields.

### Scope Boundaries

**In Scope:**

- New API route that calls Zoho Inventory (items + sales-by-item or equivalent) for Products page only.
- Products page wired to new route; table columns: single Product (name + SKU), Quantity Sold, Amount, optional Price/Average Price, Status only if from Inventory.
- Sales metrics (quantity sold, amount) set up and displayed in this spec.
- One token with both Books and Inventory scopes; existing env var names.

**Out of Scope:**

- Dashboard page or "top products" widget using Inventory (future spec).
- Performance page or any other page switching to Inventory in this spec.
- Using both APIs in many areas around the dashboard (defer to later).
- Separate Inventory client or `ZOHO_INVENTORY_*` env vars.

### Technical Considerations

- Zoho Inventory API has different base path and endpoints than Books; add Inventory API integration (items list, sales-by-item or equivalent report) alongside existing Books usage.
- Same OAuth client and env vars; refresh token must include both Books and Inventory scopes.
- New route preserves search/sort/pagination semantics expected by the current Products page UI.
- Status column presence depends on Inventory API capability; if not available, remove column from table and types.
