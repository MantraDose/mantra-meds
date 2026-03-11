# Task Breakdown: Products Page — Zoho Data

## Overview

Total Tasks: 4 groups (Backend/Zoho, API Route, Frontend, Testing)

This spec has **no database layer**; data comes from Zoho Inventory via a new Next.js API route. Task groups are ordered by dependency. **Pauses** and **Tasks for you** are called out so you can verify work and perform Zoho Console steps in tandem.

---

## Tasks for you (in tandem)

These require your action in Zoho and in the repo; do them when each group asks.

- **[Before Group 1]** Create a Server-based Application in [Zoho API Console](https://api-console.zoho.com/): Client Type → Server-based Applications → CREATE NOW. Note the **Client ID** and **Client Secret**. Configure redirect URI if required (e.g. `http://localhost:3000` or a dummy server callback URL per Zoho docs).
- **[After Group 1, before Group 2]** Generate a **Refresh Token** for Zoho Inventory (OAuth flow: authorize the app, exchange code for refresh token). Add to `.env.local`: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` (and optionally `ZOHO_INVENTORY_ORGANIZATION_ID` if needed). Do not commit `.env.local`.
- **[Optional]** Add `.env.example` with placeholder names for the Zoho variables (no real values) so other devs know what to set.

---

## Task List

### Backend: Zoho integration

#### Task Group 1: Zoho client and token flow

**Dependencies:** None  
**After this group:** PAUSE — you create the Zoho client and refresh token, then add env vars (see **Tasks for you** above).

- [x] 1.0 Complete Zoho server-side integration
  - [x] 1.1 Add env variable checks for Zoho credentials
    - Read `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` from `process.env` in server-only code; fail clearly at runtime if missing (e.g. when calling Zoho), without exposing values to the client.
  - [x] 1.2 Implement Zoho OAuth token refresh
    - Server-only module that uses the refresh token to obtain a new access token from Zoho OAuth endpoint; handle token response and store/return access token for use in API calls. Use Zoho Inventory / Books OAuth token URL per Zoho docs.
  - [x] 1.3 Implement Zoho Inventory Items fetch
    - Server-only function that gets a valid access token (via 1.2) and calls Zoho Inventory “List Items” (or equivalent) API; return raw items array or normalized list. Handle Zoho API errors and map to a simple error shape (no credentials or raw Zoho payloads to caller).
  - [x] 1.4 Document Zoho setup steps
    - Add a short doc (e.g. in `agent-os/specs/2026-02-27-products-page-zoho-data/` or README) describing: create Server-based client in Zoho API Console, run OAuth flow to get refresh token, set `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` in `.env.local`. Reference Zoho Inventory API docs for List Items endpoint.

**Acceptance criteria**

- Server-only code reads Zoho env vars and uses them only on the server.
- Token refresh succeeds when valid refresh token is in env; Zoho Items API is called with a valid access token.
- Zoho errors are handled and not exposed to the client; setup steps are documented.

---

**PAUSE — Check:** Run or call the Zoho token refresh and Items fetch (e.g. via a temporary script or log in the API route). Then complete **Tasks for you**: create client, get refresh token, add env vars. Proceed to Group 2 once `/api/products` can be implemented.

---

### API layer

#### Task Group 2: GET /api/products

**Dependencies:** Task Group 1 (Zoho fetch working); env vars set by you.

- [x] 2.0 Complete products API route
  - [x] 2.1 Define shared product response type
    - Type/interface for API response item: at least `id`, `name`; add `sku`, `price` (or `sellingPrice`), `status` as applicable from Zoho. Use in both API route and frontend so contract is clear.
  - [x] 2.2 Implement GET `/api/products`
    - Next.js App Router route handler (e.g. `app/api/products/route.ts`). Call Zoho Items fetch (from 1.3), map Zoho items to the shared product type (id, name, sku, price, status). Return JSON array with 200. Follow `agent-os/standards/backend/api.md` (plural resource, RESTful).
  - [x] 2.3 Add optional `search` query parameter
    - Accept `search` (e.g. `?search=mini`); filter items by name (or SKU) server-side before returning, or return all and document that client filters (spec allows either; prefer server-side).
  - [x] 2.4 Harden error and status codes
    - On Zoho auth failure or missing env: return 501 or 503 with a generic message (e.g. “Products unavailable”). On Zoho API error: return 502 or 500 with a generic message; do not expose Zoho errors or credentials. Use appropriate HTTP status codes per API standards.

**Acceptance criteria**

- GET `/api/products` returns a JSON array of products with id, name, and at least sku/price/status as defined.
- Optional `search` query filters the list (server- or client-side as implemented).
- Errors return sensible status codes and generic messages; no Zoho internals exposed.

---

**PAUSE — Check:** Call `GET /api/products` and `GET /api/products?search=...` (e.g. from browser or curl) and confirm response shape and filtering. Then proceed to Group 3.

---

### Frontend

#### Task Group 3: Products page wiring and UI

**Dependencies:** Task Group 2 (GET `/api/products` working).

- [x] 3.0 Complete Products page with Zoho-backed list
  - [x] 3.1 Fetch products from API on load
    - In `app/dashboard/products/page.tsx`, replace `products` from `lib/mock-data` with a fetch to `/api/products` (e.g. in `useEffect` or on mount). Use the shared product type from 2.1 for the response.
  - [x] 3.2 Add loading state
    - While the request is in progress, show a loading indicator (e.g. skeleton rows, spinner, or “Loading products…”) so the user knows data is loading.
  - [x] 3.3 Add error state
    - On API error (non-2xx), show a user-friendly message (e.g. “Unable to load products. Please try again.”) without exposing Zoho or server details.
  - [x] 3.4 Remove Category and Status filters
    - Remove the two Select dropdowns and their state (`category`, `status`); keep only the search input and search state. Filter the displayed list by search term (client-side on the API response, or pass search to API if implemented in 2.3).
  - [x] 3.5 Adapt table to master-data columns
    - Table columns for this iteration: at least Product (name); add SKU, Price, Status if provided by the API. Omit or stub Units Sold, Revenue, Avg Price, Last Sale (e.g. hide columns or show “—” or leave for later). Keep table layout (Card, Table, existing styling) and match `planning/visuals/dashboard-product-list.png` for what’s in scope.
  - [x] 3.6 Keep search and empty state
    - Search input filters the list; when no products match, show empty state (e.g. “No products match your search” or “No products found”) with existing card/table styling.
  - [x] 3.7 Keep expandable row and ProductDetail
    - Retain row click to expand/collapse; expanded row still uses `ProductDetail` with mock `monthlySales` (or placeholder). Ensure product `id` type (e.g. string from Zoho) is compatible with `ProductDetail` and `expandedId` state.

**Acceptance criteria**

- Products page loads data from `/api/products` and shows loading then list (or error).
- Only search is used for filtering; no Category/Status dropdowns.
- Table shows at least Product name plus SKU/Price/Status as provided by the API; empty and error states are clear and on-brand.

---

**PAUSE — Check:** Open the Products page; confirm list loads from Zoho, search works, loading/error states look good, and expandable row still works. Then proceed to Group 4.

---

### Testing

#### Task Group 4: Focused tests and gap check

**Dependencies:** Task Groups 1–3 complete.

- [x] 4.0 Review and add focused tests for this feature
  - [x] 4.1 Add 2–6 focused tests for the products API
  - [x] 4.2 Add 2–6 focused tests for the Products page (optional)
  - [x] 4.3 Run feature-related tests only

**Acceptance criteria**

- New tests for `/api/products` and (if added) Products page pass.
- No more than ~6–12 new tests total for this spec; focus on critical paths and integration points.

---

## Execution order and pauses

1. **Task Group 1** (Zoho client + token + Items fetch) → **PAUSE** → You: create Zoho client, get refresh token, set env vars.
2. **Task Group 2** (GET `/api/products`) → **PAUSE** → You: verify `/api/products` and optional `search` in browser or curl.
3. **Task Group 3** (Products page) → **PAUSE** → You: verify full flow on the Products page (load, search, loading/error, expandable row).
4. **Task Group 4** (Tests) → Final check.

---

## Summary: your actions

| When           | Your action                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Before Group 1 | Create Server-based Application in Zoho API Console; note Client ID and Client Secret.                                 |
| After Group 1  | Run OAuth flow to get Refresh Token; add `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` to `.env.local`. |
| After Group 2  | Manually test `GET /api/products` and `GET /api/products?search=...`.                                                  |
| After Group 3  | Manually test Products page: load, search, loading/error, expandable row.                                              |
