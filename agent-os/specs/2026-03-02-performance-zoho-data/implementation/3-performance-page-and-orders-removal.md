# Implementation: Task Group 3 — Performance page and Orders removal

## Summary

Removed the Orders table and card from the Performance page, wired the page to GET `/api/performance`, added date range display and loading/error states, refactored ChannelChart to accept data via props (with revenue-only and wholesale/retail support), and cleaned up unused OrdersTable and `orders` mock data.

## Files changed

### Removed
- **`components/tables/orders-table.tsx`** — Deleted (only used on Performance page).

### Modified
- **`app/dashboard/performance/page.tsx`**
  - Removed `OrdersTable` import and usage.
  - Added state: `data` (PerformanceSummary | null), `loading`, `error`.
  - On mount: fetch GET `/api/performance`; on success set data; on error set generic message; show loading skeletons for KPIs.
  - **Date range:** When `data.dateRange` is present, display formatted range (e.g. "Mar 2, 24 – Mar 2, 25") below the subtitle using `formatDateRange()`.
  - **KPI cards:** Total Revenue, Total Orders, Avg Order Value from API; currency/integer formatting; no "vs last year" trend; Avg Order Value shows "—" when no orders.
  - **Error:** Inline error message + Retry button that re-fetches.
  - **Chart:** Pass `chartData` (mapped from `data.revenueByMonth` to `{ month, revenue }[]`) to `ChannelChart`; handle empty data (empty array passed to chart).
- **`components/charts/channel-chart.tsx`**
  - Removed import of `channelData` from `@/lib/mock-data`.
  - Added prop `data: ChannelChartDataPoint[]` where `ChannelChartDataPoint = { month: string; wholesale?: number; retail?: number; revenue?: number }`.
  - When data has `wholesale`/`retail` (hasWholesaleRetail): stacked bar chart, legend shows Wholesale % / Retail %.
  - When data has only `revenue` (hasRevenueOnly): single Bar with `dataKey="revenue"`, legend shows "Revenue".
  - CustomTooltip supports both modes (Revenue vs Wholesale/Retail labels).
  - Exported type `ChannelChartDataPoint` for the page to use.
- **`lib/mock-data.ts`**
  - Removed `orders` export and its generator (only OrdersTable used it). Left `seeded` helper in place (used by other mock data if needed).

## Design notes

- Performance page uses a local `PerformanceSummary` interface matching the API response; no server-only import from `lib/zoho/performance`.
- Date range is formatted with `Intl.DateTimeFormatOptions` (month: short, day: numeric, year: 2-digit); fallback "Last 12 months" if parse fails.
- Channel filter (All / Wholesale / Retail) remains; for revenue-only data the chart shows the single Revenue bar regardless of filter.

## Verification

- Linter: no errors on modified files.
- Full test suite: 50 tests passed (no Performance page tests in suite yet; Task Group 4 is optional).
