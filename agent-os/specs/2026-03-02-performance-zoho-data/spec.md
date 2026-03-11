# Specification: Performance Page Real Data and Remove Orders

## Goal

Replace placeholder data on the Performance page with real data from the existing Zoho Books API integration, and remove the Orders table and card from the page. KPIs (Total Revenue, Total Orders, Avg Order Value) and the Channel Breakdown chart will be driven by Zoho Books invoices; the Orders table will be removed entirely.

## User Stories

- As a founder or investor, I want the Performance page to show real revenue, order count, and average order value from Zoho Books so that the dashboard reflects actual business data.
- As a user, I want to see revenue (and optionally channel mix) over time from real invoices, not mock data.
- As a product owner, I want the Orders table removed from the Performance page so the page focuses on summary metrics and the channel chart only.

## Specific Requirements

**Remove Orders table and card**

- Remove the Orders table and its containing card from the Performance page.
- Remove the `OrdersTable` component from the Performance page and delete the `components/tables/orders-table.tsx` file (it is only used on this page).
- Remove the `orders` export from `lib/mock-data.ts` if no other code references it (only OrdersTable used it).
- No replacement order list or drill-down is required in this spec.

**Performance data from Zoho Books**

- Use the existing Zoho Books integration (config, token, books base URL). Add a new server-side data source that fetches invoice list from Zoho Books **for the last 12 months only** (using Zoho’s `date_start` and `date_end` list-invoices parameters) to keep response time low. Compute:
  - **Total revenue**: Sum of invoice totals (paid or equivalent statuses as per business rule; at minimum include invoices that represent completed sales).
  - **Total orders**: Count of invoices (same status filter as revenue).
  - **Average order value**: Total revenue / total orders (show as $0 or "—" if no orders).
- Revenue-by-month (and optionally wholesale/retail by month) for the Channel Breakdown chart:
  - **Revenue by month**: Aggregate invoice totals by invoice date (month/year). Use the same status filter as above. Return an array of `{ month: string, revenue: number }` or, if channel is available in Books, `{ month: string, wholesale: number, retail: number }`.
  - **Channel (wholesale vs retail)**: Zoho Books does not have a built-in "channel" field. If the organization uses a convention in Books (e.g. custom field on invoice, customer type, or tag), derive wholesale/retail from that and return both series. If no convention exists, return a single revenue series by month and have the chart show "Revenue" only (single series or treat wholesale/retail as same). Document in implementation how channel is determined or that it is revenue-only until a convention is defined.
- **Date range**: Return the period used for the data as `dateRange: { start: string, end: string }` (yyyy-mm-dd) so the UI can display it (e.g. "Last 12 months" or "Mar 2, 2024 – Mar 2, 2025").

**API route**

- Add GET `/api/performance` (or `/api/performance/summary`) that:
  - Calls the new Zoho Books performance data function(s).
  - Returns JSON: `{ totalRevenue, totalOrders, averageOrderValue, revenueByMonth, dateRange? }` (and optionally `channelByMonth` with `wholesale`/`retail` if applicable). `dateRange` is `{ start, end }` in yyyy-mm-dd for the period the data covers.
  - Uses the same error pattern as Products API: 503 when Zoho credentials not configured, 502 on Books API failure; generic user-facing message only.
  - Does not expose raw Zoho errors or credentials.

**Performance page UI**

- Performance page fetches from `/api/performance` (or the chosen route). No mock data for KPIs or channel chart.
- **Date range display**: Show the period the data represents using the API’s `dateRange` (e.g. "Last 12 months" or formatted range like "Mar 2, 2024 – Mar 2, 2025") near the page title or above the KPI cards so users know what period the metrics and chart cover. A date-range selector (e.g. dropdown or picker to change the period) is out of scope for this spec and can be added later.
- **KPI cards**: Display Total Revenue, Total Orders, and Avg Order Value from the API. Format currency and numbers consistently (e.g. $760,800; 1,284; $592.50). "Vs last year" trend is out of scope unless the API provides a previous-period value (optional: can be added later when date-range or comparison data is available).
- **Channel chart**: Receive data from the API. If API returns channel breakdown (wholesale/retail by month), show the existing stacked bar chart. If API returns only revenue by month, show a single-series bar chart (or same chart with one series) and keep the existing "All / Wholesale / Retail" filter behavior sensible (e.g. "All" shows revenue, other filters can hide or show same series until channel is available).
- **Loading and error states**: Show loading state while fetching; on error (502/503 or network error), show an error message and optionally retry. Reuse patterns from the Products page (e.g. error boundary or inline error message).

**ChannelChart component**

- Refactor `ChannelChart` to accept data as props (e.g. `data: { month: string; wholesale?: number; retail?: number; revenue?: number }[]`) instead of importing `channelData` from mock-data. The chart should support:
  - Dual series: `wholesale` and `retail` for stacked bars (current behavior).
  - Single series: `revenue` only (or wholesale + retail both zero except revenue in one) for revenue-by-month when channel is not in Books.
- Keep existing Channel filter buttons (All, Wholesale, Retail) and styling; behavior stays consistent with the data shape returned by the API.

**Trend "vs last year"**

- Current placeholder shows "+12.4% vs last year" etc. Out of scope for this spec: computing year-over-year comparison requires either a second API call for previous period or stored/cached prior data. KPI cards can show the value and omit the trend line, or show a neutral/placeholder trend until a follow-up adds comparison data.

## Existing Code to Leverage

- **lib/zoho/config.ts**, **lib/zoho/token.ts**: Reuse for Books base URL and access token. No changes required unless a new helper is added.
- **lib/zoho/reports.ts**: Already fetches invoice list and details for sales-by-item. Extend or add a new function (e.g. `fetchZohoPerformanceSummary`) that lists invoices, optionally with date filters, and aggregates by total and by month (and by channel if convention exists). Reuse `getZohoAccessToken()`, `getZohoConfig()`, and error handling patterns.
- **app/dashboard/performance/page.tsx**: Reuse page layout, MetricCard, ChannelChart, and channel state. Remove OrdersTable import and usage; add fetch to `/api/performance` and wire KPIs and chart to API response; add loading/error UI.
- **components/charts/channel-chart.tsx**: Refactor to take data prop; remove import of `channelData` from mock-data.
- **components/charts/metric-card.tsx**: No change; already accepts title, value, trend, subtitle as props.

## Out of Scope

- Year-over-year or other period comparison (e.g. "vs last year") unless trivially derivable from existing API data.
- **Date-range selector**: A control to change the period (e.g. dropdown or date picker) is out of scope; the UI only displays the range returned by the API (e.g. "Last 12 months"). Can be added in a follow-up.
- Adding or editing data in Zoho Books (read-only).
- Syncing Books data into a database; data is fetched on demand.
- Orders table elsewhere or a replacement order list/drill-down.
- Changes to other pages that use mock-data (e.g. dividends, payables, profile); only Performance page and ChannelChart are in scope.
- Defining or implementing the Books convention for wholesale vs retail if not already present; spec allows revenue-only chart until convention exists.

## Success Criteria

- Performance page shows Total Revenue, Total Orders, and Avg Order Value from Zoho Books invoices (no hardcoded placeholder values).
- Performance page displays the date range (e.g. "Last 12 months" or formatted start–end) so users know what period the data covers.
- Channel Breakdown chart is driven by API data (revenue by month, and wholesale/retail by month if supported by Books convention).
- Orders table and card are removed; OrdersTable component is deleted; `orders` mock data is removed if unused.
- Loading and error states are handled on the Performance page.
- GET `/api/performance` returns 200 with the expected summary shape (including `dateRange` when applicable); returns 502/503 with a generic message on failure.
- No Zoho credentials or raw API errors are exposed to the client.

