# Implementation: Task Group 1 — Invoice-based performance data

## Summary

Added a new server-only module `lib/zoho/performance.ts` that fetches Zoho Books invoices via the List Invoices API, filters by completed statuses (`paid`, `sent`, `viewed`), and aggregates:

- **totalRevenue**: Sum of invoice `total`
- **totalOrders**: Count of included invoices
- **averageOrderValue**: totalRevenue / totalOrders (0 if no orders)
- **revenueByMonth**: Array of `{ month: string, revenue: number }` with month labels like "Mar 25", sorted chronologically

Channel (wholesale/retail) is not derived; Zoho Books has no built-in channel field. The type `ChannelByMonthRow` is exported for future use when a Books convention exists.

## Files touched

- **Added:** `lib/zoho/performance.ts`
  - Types: `PerformanceSummary`, `RevenueByMonthRow`, `ChannelByMonthRow`, `PerformanceSummaryResult`, `PerformanceSummaryError`
  - `fetchZohoPerformanceSummary()`: paginates GET `/invoices` (page, per_page=200, max 10 pages), filters by status, aggregates totals and by month key (from invoice date), returns `{ ok: true, data }` or `{ ok: false, message }`
  - Error handling aligned with `lib/zoho/reports.ts`: credentials not configured, Zoho auth failed, generic failure; no raw Zoho errors or credentials exposed

## Design notes

- **Status filter:** Only invoices with status in `["paid", "sent", "viewed"]` are included (completed sales). Draft/overdue can be added later if needed.
- **Pagination:** Zoho Books list invoices is called with `page` and `per_page`; looping stops when `has_more_page` is false or invoices length &lt; per_page or after MAX_PAGES.
- **Month key:** Invoice `date` (YYYY-MM-DD) is converted to a label "MMM yy" (e.g. "Mar 25") for grouping; months are sorted chronologically before building `revenueByMonth`.
- **Organization:** Uses existing `getZohoConfig()` and optional `organizationId` in query string.

## Verification

- No linter errors on `lib/zoho/performance.ts`.
- Task Group 2 will call `fetchZohoPerformanceSummary()` from GET `/api/performance` to confirm the data shape end-to-end.
