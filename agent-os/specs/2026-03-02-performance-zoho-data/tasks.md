# Task Breakdown: Performance Page Real Data and Remove Orders

## Overview

Total Tasks: 4 groups (Backend performance data, API route, Frontend and cleanup, Optional tests)

This spec has **no database layer**. Work is: (1) add Zoho Books invoice-based performance summary in `lib/zoho` (last 12 months via date_start/date_end), (2) add GET `/api/performance` (response includes dateRange), (3) remove Orders table from the Performance page, drive KPIs and chart from API, **display date range** on the page, refactor ChannelChart to use props, delete OrdersTable and unused mock `orders`, (4) optional tests. **Pauses** and **Tasks for you** are included for verification.

---

## Tasks for you (in tandem)

- **[Before Group 1]** Confirm Zoho Books credentials are configured (same as Products page). Optionally call existing `/api/products` to confirm Books is reachable.
- **[After Group 2]** Call GET `/api/performance` and confirm response has `totalRevenue`, `totalOrders`, `averageOrderValue`, `revenueByMonth`, and `dateRange` (or `channelByMonth`). Then proceed to Group 3.
- **[After Group 3]** Open the Performance page; confirm KPIs and chart show real data, date range is displayed, Orders table is gone, and loading/error states work. No console or network errors.

---

## Task List

### Backend: Zoho Books performance summary

#### Task Group 1: Invoice-based performance data

**Dependencies:** None (existing Zoho config and token)

- [x] 1.0 Add performance summary from Zoho Books invoices
  - [x] 1.1 Implement `fetchZohoPerformanceSummary` (or equivalent) in `lib/zoho/reports.ts` or a new file (e.g. `lib/zoho/performance.ts`).
    - Call Zoho Books List Invoices (GET `/invoices`) with existing auth and books base URL. Use optional `ZOHO_ORGANIZATION_ID` if present. Prefer fetching enough invoices to cover the desired period (e.g. last 12 months); use pagination if needed.
    - From list response (or detail if needed), read per invoice: `total`, `invoice_id`, `date` (and optionally a field for channel if convention exists). Filter by status: include only invoices that represent completed sales (e.g. "paid", "sent"—align with Zoho Books status values).
  - [x] 1.2 Aggregate to summary shape:
    - **totalRevenue**: Sum of invoice totals (filtered by status).
    - **totalOrders**: Count of invoices (same filter).
    - **averageOrderValue**: totalRevenue / totalOrders (0 or null if no orders).
    - **revenueByMonth**: Group by month (from invoice date); array of `{ month: string, revenue: number }` (e.g. "Mar 25", "Apr 25"). If channel convention exists (custom field, customer type, or tag), also produce `wholesale` and `retail` per month and expose as `channelByMonth` or within same structure.
    - **dateRange**: Include `{ start, end }` (yyyy-mm-dd) in the summary so the UI can display the period (e.g. "Last 12 months"). Use Zoho list-invoices `date_start` and `date_end` to fetch only the last 12 months (fewer pages, faster).
  - [x] 1.3 Return type: `{ ok: true, data: PerformanceSummary } | { ok: false, message: string }`. Do not expose raw Zoho errors or credentials. Use same error handling as existing reports (credentials not configured, auth failed, generic failure).
  - [x] 1.4 Define a shared type for the summary (e.g. `PerformanceSummary`: `totalRevenue`, `totalOrders`, `averageOrderValue`, `revenueByMonth`, and optionally channel series). Keep in `lib/zoho` or `lib/types` as appropriate.

**Acceptance Criteria:**

- New function fetches invoices from Zoho Books and returns aggregated totalRevenue, totalOrders, averageOrderValue, and revenueByMonth (and optional channel breakdown).
- Errors return `{ ok: false, message }` with generic user-facing messages; no Zoho internals exposed.

**PAUSE — Check:** Optionally call the new function from a script or the upcoming API route to confirm data shape. Then proceed to Group 2.

---

### API: Performance route

#### Task Group 2: GET /api/performance

**Dependencies:** Task Group 1

- [x] 2.0 Add GET `/api/performance` route
  - [x] 2.1 Create `app/api/performance/route.ts` (or `app/api/performance/summary/route.ts`).
    - In GET handler, call `fetchZohoPerformanceSummary()` (or the function from Group 1).
  - [x] 2.2 On success: return 200 with JSON body matching PerformanceSummary (totalRevenue, totalOrders, averageOrderValue, revenueByMonth, dateRange; optional channel series).
  - [x] 2.3 On failure: return 503 when message indicates credentials not configured (or missing env); return 502 on Books API failure. Body: `{ error: "…" }` with a generic message only (e.g. "Performance data unavailable. Please try again later."). No Zoho errors or credentials in response.
  - [x] 2.4 Do not cache Zoho responses in route unless required; same pattern as products route (e.g. revalidate 0 in fetch if used).

**Acceptance Criteria:**

- GET `/api/performance` returns 200 with summary object; 502/503 with generic error message on failure.
- No raw Zoho errors or credentials in response.

**PAUSE — Check:** Call GET `/api/performance` and confirm shape. Then proceed to Group 3.

---

### Frontend and cleanup

#### Task Group 3: Performance page and Orders removal

**Dependencies:** Task Group 2

- [x] 3.0 Remove Orders table and wire Performance page to API
  - [x] 3.1 Remove Orders table and card from Performance page
    - In `app/dashboard/performance/page.tsx`: remove import and usage of `OrdersTable`. Remove any state used only for the table (e.g. channel state can remain for the chart filter).
  - [x] 3.2 Delete `components/tables/orders-table.tsx` (only used on Performance page).
  - [x] 3.3 Remove `orders` from `lib/mock-data.ts` (only used by OrdersTable). If any other file imports `orders`, remove that usage first.
  - [x] 3.4 Fetch performance data on the Performance page
    - On mount (or in a server component if preferred), fetch GET `/api/performance`. Store result in state (or use SWR/React Query if already in project).
    - Show loading state while fetching (e.g. skeleton or "Loading…" for KPIs and chart).
    - On error (4xx/5xx or network error), show an error message and optionally a retry action. Do not show raw API error body.
  - [x] 3.5 Display date range on the Performance page
    - Using the API response’s `dateRange` (when present), show the period the data represents (e.g. "Last 12 months" or formatted "Mar 2, 2024 – Mar 2, 2025") near the page title or above the KPI cards so users know what period the metrics and chart cover. A date-range selector (dropdown/picker) is out of scope; display only.
  - [x] 3.6 Wire KPI cards to API data
    - Total Revenue: format as currency from `totalRevenue`.
    - Total Orders: format as integer from `totalOrders`.
    - Avg Order Value: format as currency from `averageOrderValue` (show "—" or $0 if no orders).
    - Omit or simplify "vs last year" trend (out of scope); can leave subtitle as "vs last year" with no trend value or remove subtitle until comparison is implemented.
  - [x] 3.6 Refactor ChannelChart to accept data via props
    - Change `ChannelChart` to accept a prop such as `data: { month: string; wholesale?: number; retail?: number; revenue?: number }[]`. Remove import of `channelData` from `lib/mock-data`.
    - If API returns only revenue by month: pass data in a shape the chart can use (e.g. `revenue` only per month) and render a single-series bar chart; keep "All" filter or hide Wholesale/Retail filters if not applicable.
    - If API returns wholesale/retail by month: pass that and keep existing stacked bar behavior. Ensure month labels match (e.g. "Mar 25").
  - [x] 3.7 Performance page passes API data to ChannelChart
    - Use `revenueByMonth` (and optional channel series) from API response as the `data` prop for ChannelChart. Handle empty or missing data (e.g. show empty chart or message).

**Acceptance Criteria:**

- Performance page has no Orders table or OrdersTable component. OrdersTable file is deleted; `orders` mock is removed.
- KPIs and Channel Breakdown chart are driven by GET `/api/performance`. Loading and error states are handled.
- Date range (e.g. "Last 12 months" or formatted start–end) is displayed so users know what period the data covers.
- ChannelChart receives data from props; no mock-data import for channel data.

**PAUSE — Check:** Open Performance page in browser; confirm real KPIs, chart from API, no Orders section, and no errors. Then proceed to Group 4.

---

### Testing (optional)

#### Task Group 4: Tests

**Dependencies:** Task Groups 1–3

- [x] 4.0 Optional: add or update tests
  - [x] 4.1 API route test for GET `/api/performance`: mock `fetchZohoPerformanceSummary`; assert 200 with expected shape; assert 502/503 and generic error body on failure.
  - [x] 4.2 Performance page test: assert Orders table is not rendered; assert KPIs and chart are present; mock fetch to return summary and assert displayed values or loading/error states if testable.
  - [x] 4.3 Run tests and fix any failures.

**Acceptance Criteria:**

- If tests are added, they pass and do not expose Zoho internals or credentials.

---

## Execution Order

1. **Task Group 1** (Zoho Books performance summary) → **PAUSE** → optional check.
2. **Task Group 2** (GET `/api/performance`) → **PAUSE** → you: confirm API response shape.
3. **Task Group 3** (Remove Orders, wire page to API, refactor ChannelChart) → **PAUSE** → you: confirm Performance page in browser.
4. **Task Group 4** (Optional tests).

No database or migration tasks. Implementation is confined to Zoho Books performance aggregation, new API route, Performance page, ChannelChart refactor, and removal of Orders table and related mock data.
