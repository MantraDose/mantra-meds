# Specification: Products Page — Zoho Data

## Goal

Populate the dashboard Products page with a real product list from Zoho Inventory by adding a server-side API that fetches items from Zoho and wiring the existing Products UI to that API, showing product master data only and keeping search (no category/status filters in this iteration).

## User Stories

- As an investor or founder, I want to see the actual product list from Zoho Inventory on the Products page so that I view real company data instead of mock data.
- As an admin, I want the dashboard to read product data from Zoho via our own API so that credentials stay on the server and the app stays secure.

## Specific Requirements

**Zoho integration (server-side only)**

- Use Zoho Inventory as the sole data source for the product list.
- Use a "Server-based Applications" client type; all Zoho API calls must run on the server (Next.js API route or server action), never in the browser.
- Store Zoho credentials in environment variables (e.g. `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`); document or provide steps for creating the client and obtaining a refresh token in Zoho API Console.
- Implement server-side logic to obtain and refresh Zoho access tokens using the refresh token; call Zoho Inventory Items API to fetch items and return them in a stable, documented shape.

**Products API route**

- Add a GET endpoint for products (e.g. `/api/products`) following project API standards: plural resource name, RESTful design.
- Support an optional `search` query parameter to filter items by name (or other relevant master field); filtering may be done server-side (recommended) or by returning all items and letting the client filter.
- Return JSON with a list of product objects; each object must include at least: stable id (e.g. Zoho item id), name, and any fields needed for the first-iteration table (e.g. SKU, selling price, status if available from Zoho).
- Use appropriate HTTP status codes (e.g. 200, 401, 500) and do not expose Zoho credentials or raw Zoho errors to the client.

**Products page data source and UI**

- Replace the mock `products` data source on the Products page with a call to the new products API (e.g. fetch on load or via a data-fetching pattern used in the app).
- Display only product master data in the table for this spec: at minimum product name; include SKU and price (and status if provided by the API) as agreed for the first iteration. Omit Units Sold, Revenue, Avg Price, and Last Sale from Zoho until a later iteration (columns may show placeholders, be hidden, or show a minimal set; align with "minimal product data" requirement).
- Keep the existing search input and wire it to filter the list (client-side filter on API response, or pass search term to the API if the endpoint supports it).
- Remove the Category and Status filter dropdowns from the Products page for this iteration; add them in a future spec when more columns/data are available.

**Table and expandable row behavior**

- Retain the existing table layout (Card, Table, search bar) and expandable row pattern; ensure the table works with the new product shape (e.g. id, name, sku, price, status). Expandable row may still show the existing ProductDetail component with mock chart data for now, or show a simple placeholder; chart data from Zoho is out of scope for this spec.

**Error and loading states**

- Handle loading state while the products API request is in progress (e.g. skeleton or message so the user knows data is loading).
- Handle API errors (e.g. 401, 500) with a clear, user-friendly message and without exposing internal or Zoho-specific details.

## Visual Design

`**planning/visuals/dashboard-product-list.png`**

- Page title "Products" with subtitle "Product-level performance analytics"; preserve existing typography and spacing.
- Single search bar with magnifying glass icon and placeholder "Search products..."; no Category or Status dropdowns in this iteration.
- Table with columns appropriate to first iteration: at least Product (name), and optionally SKU, Price, Status; omit or stub Units Sold, Revenue, Avg Price, Last Sale until Zoho sales data is integrated.
- Product name in first column, font-medium; optional category/status as pill-shaped badges if those fields are present in the API response; numeric/currency columns right-aligned.
- Row click toggles expandable detail; expanded row can continue to show existing ProductDetail (mock charts) or a minimal placeholder.
- Empty state when no products match search (e.g. "No products match your filters" or "No products found"); preserve existing card and table styling (border, muted background).

## Existing Code to Leverage

`**app/dashboard/products/page.tsx**`

- Reuse the page layout (title, Card, CardContent), search Input with Search icon, Table structure (TableHeader, TableBody, TableRow, TableCell), and expandable row state (`expandedId`, row click to toggle). Remove category and status state and the two Select dropdowns; keep only search state and filter the list by search term. Replace `products` from mock-data with data from the products API and adapt to the new product shape (id, name, sku, price, status as applicable).

`**lib/mock-data.ts**`

- Use the existing `products` array shape as a reference for the minimal front-end type (id, name, and whatever fields are shown in the first iteration). Define a type or interface for the API response that matches the chosen columns; map Zoho item fields (e.g. name, SKU, selling_price, status) to this shape in the API route or in a shared mapper. Keep `categoryColors` if category is displayed; otherwise it can be unused for this iteration.

`**components/tables/product-detail.tsx**`

- Keep using ProductDetail inside the expandable row; it can continue to receive mock `monthlySales` for now since chart data from Zoho is out of scope. No changes required to ProductDetail for this spec unless the product id type changes (e.g. string from Zoho); ensure the prop types remain compatible.

`**agent-os/standards/backend/api.md**`

- Follow RESTful design, plural nouns for the resource (`/api/products`), and query parameters for search. Use consistent HTTP status codes and do not create separate endpoints for filter variants; use optional query params instead.

**UI components (`@/components/ui/`*)**

- Continue using existing Table, Card, Input, Badge, and other shadcn-style components; preserve existing styling classes (e.g. `border-border`, `bg-card`, `text-muted-foreground`, status badge colors for Active/Inactive) so the page matches the rest of the dashboard.

## Out of Scope

- Category and Status filter dropdowns on the Products page (defer until more columns are added).
- Sourcing Units Sold, Revenue, Avg Price, or Last Sale from Zoho; sales-derived metrics are a later iteration.
- Sourcing Monthly Sales or Channel Distribution chart data from Zoho; expandable row charts remain mock or placeholder in this spec.
- Creating, updating, or deleting products in Zoho from the dashboard; read-only access only.
- Exposing Zoho API credentials, refresh tokens, or raw Zoho error payloads to the client.
- Adding a database or caching layer for Zoho data; API route may call Zoho on each request unless a simple in-memory/short TTL cache is explicitly added.
- Pagination or infinite scroll for the product list in this spec (optional for a later iteration if the list is large).
- Zoho Books or any product source other than Zoho Inventory.

