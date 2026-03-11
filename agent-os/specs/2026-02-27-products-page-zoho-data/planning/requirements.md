# Spec Requirements: Products Page — Zoho Data

## Initial Description

I'd like to begin populating the 'Products' page first with a list of products from the real zoho data.

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming we'll use Zoho Inventory (or Zoho Books) as the source for products (name, SKU, category, status, etc.). Is that correct, or are you using a different Zoho product?

**Answer:** Yes, we'll use Zoho Inventory as our data source.

**Q2:** I'm assuming we add a server-side layer (e.g. Next.js API routes) that talks to Zoho's API with server credentials (e.g. "Server-based Applications" in Zoho API Console), and the dashboard only calls our API. Is that the intended setup?

**Answer:** Server-side layer assumption is correct.

**Q3:** For the products table we have: Product name, Category, Units Sold, Revenue, Avg Price, Last Sale, Status. Should those sales-derived fields come from Zoho, or is it acceptable for this first step to show only product master data from Zoho and leave sales metrics as mock/placeholder until a later spec?

**Answer:** For the first iteration, show product master data only; keep it simple. Sales data later.

**Q4:** The expanded row shows "Monthly Sales (Units)" and "Channel Distribution". For this spec, should we exclude expandable charts and only deliver the product list table from Zoho, or do you want chart data to also be sourced from Zoho?

**Answer:** Use Zoho Inventory for this data as well; sales data is visible at bottom-right of the attached Zoho screenshot (for when we add it later).

**Q5:** I'm assuming we keep the existing Search, All Categories, and All Status UI and wire them to filter the Zoho-sourced list. Should filters and search apply to this first Zoho-backed list?

**Answer:** Remove the category and status filters for the first list; keep search. Add filters when we add more columns.

**Q6:** I'm assuming Zoho API credentials (client id/secret, refresh token) live in env vars (e.g. .env.local) and are never exposed to the browser. Do you already have a Zoho "Server-based" client and refresh token?

**Answer:** Correct about env vars. User needs help creating the Zoho client and tokens; the API console was empty in the first prompt.

**Q7:** For "populate with a list of products from real Zoho data," should we treat creating/editing products in Zoho as out of scope and only read product data from Zoho for now?

**Answer:** Read only — yes.

**Q8:** Is there anything you explicitly want out of this first pass?

**Answer:** No category/status filters, minimal product data for now, etc. as already discussed; use project standards.

### Existing Code to Reference

**Similar Features Identified:**

- **Products page:** `app/dashboard/products/page.tsx` — Table with search, sort, expandable rows, category/status badges; currently uses `lib/mock-data` (`products`, `productMonthlySales`, `categoryColors`). Reuse table structure, search input, and ProductDetail expandable pattern; remove category/status filter dropdowns for first iteration.
- **Mock data:** `lib/mock-data.ts` — Product shape (id, name, category, unitsSold, revenue, avgPrice, lastSale, status). First iteration will replace with Zoho master data (e.g. name, SKU, price, status); map Zoho fields to a minimal product type for the list.
- **Backend/API standards:** `agent-os/standards/backend/api.md` — RESTful design, plural resource names, query params for filter/sort/pagination. New API route(s) for products should follow these conventions (e.g. GET `/api/products` with optional `search` query param).

No additional similar features were explicitly listed; user asked to "use our standards."

### Follow-up Questions

None asked; answers were sufficient.

## Visual Assets

### Files Provided:

No visual files were found in `agent-os/specs/2026-02-27-products-page-zoho-data/planning/visuals/` (mandatory bash check). User provided images in the conversation:

- **Products page (target UI):** Table with columns Product, Category, Units Sold, Revenue, Avg Price, Last Sale, Status; search bar; category and status filter dropdowns; colored category/status badges; expandable row with Monthly Sales (Units) and Channel Distribution charts.
- **Zoho API Console:** "Choose a Client Type" — Server-based Applications is the relevant option for backend integration.
- **Zoho Inventory (Items):** Active Items list (name, SKU, price); selected item "Black Minis (4PK)" with Overview (Selling Price, Sales Account, Description, Reporting Tags), stock info, and Sales Order Summary chart + Total Sales — confirms master data and sales data availability for future iterations.

### Visual Insights:

- Target table layout and search are clear; category/status filters to be removed for first iteration per answers.
- Zoho Inventory provides item list (name, SKU, price) and overview fields suitable for product master data; sales summary exists for later chart integration.
- Fidelity: reference screenshots of existing dashboard and Zoho UI; implementation should follow existing app styling and backend API standards.

## Requirements Summary

### Functional Requirements

- Populate the Products page with a list of products from **Zoho Inventory** (real API data).
- **Data source:** Zoho Inventory Items API (product master data only for first iteration).
- **Backend:** Server-side layer (Next.js API route(s)) that calls Zoho API with server-held credentials; dashboard calls our API only.
- **Product list:** Display product master data (e.g. name, SKU, price, status) in the existing table; minimal columns for now.
- **Search:** Keep search; wire it to filter the Zoho-sourced list (client- or server-side).
- **Filters:** Remove category and status filter dropdowns for the first list; add when more columns are added.
- **Read only:** No creating or editing products in Zoho from the dashboard.
- **Credentials:** Zoho client id, secret, and refresh token in `.env.local`; spec should support (or document) helping user create the Zoho client and tokens.

### Reusability Opportunities

- Reuse Products page table, search input, and expandable row structure in `app/dashboard/products/page.tsx`.
- Replace mock `products` source with API call to new backend route; adapt product type to Zoho master fields.
- Follow `agent-os/standards/backend/api.md` for RESTful product endpoint(s) and query params (e.g. `search`).

### Scope Boundaries

**In Scope:**

- Next.js API route(s) that authenticate with Zoho and fetch items from Zoho Inventory.
- Products page showing Zoho-sourced product list (master data only).
- Search filtering the product list.
- Env-based Zoho credentials; documentation or steps to create Zoho client and tokens.

**Out of Scope:**

- Category and status filter dropdowns (defer until more columns).
- Units Sold, Revenue, Avg Price, Last Sale from Zoho (sales data in a later iteration).
- Expandable row charts (Monthly Sales, Channel Distribution) from Zoho in this spec.
- Creating or editing products in Zoho from the dashboard.

### Technical Considerations

- **Zoho API:** Use "Server-based Applications" client type; credentials in `.env.local`; help user create client and tokens.
- **API design:** Plural resource (e.g. `/api/products`), query params for search per backend API standards.
- **Mapping:** Map Zoho Inventory item fields (e.g. name, SKU, selling price, status) to a minimal product type for the table; align with existing UI (e.g. product name, price; category/status if available in Zoho and needed for display later).
- **Existing stack:** Next.js App Router, React, TypeScript; no existing Zoho integration — new server-side Zoho client and token flow required.
