# Spec Requirements: Performance Page Real Data and Remove Orders

## Initial Description

Replace placeholder data on the Performance page with real data from the Zoho Books API integration, and remove the Orders table and card from the page.

## Requirements Discussion

### First Round Questions

**Q1:** Should the Performance page KPIs (Total Revenue, Total Orders, Avg Order Value) and the Channel Breakdown chart be sourced entirely from Zoho Books (e.g. invoices), with no mock or hardcoded values?

**Answer:** Yes. Use real data from Zoho Books; remove placeholders.

**Q2:** Do you want the Orders table (and its Export CSV) removed from the Performance page with no replacement, or should we keep it but eventually drive it from an API?

**Answer:** Remove the Orders table and card entirely; no replacement in this spec.

**Q3:** Zoho Books invoices don’t have a built-in "channel" (wholesale vs retail). How should we handle the Channel Breakdown chart—revenue by month only, or do you already use a custom field / customer type / tag in Books to distinguish wholesale vs retail?

**Answer:** (Assumed for spec: if no channel convention exists in Books, show revenue by month only; if a convention exists, derive wholesale/retail and show both series. Document how channel is determined.)

**Q4:** Should "vs last year" trend on the KPI cards be implemented in this spec (would require previous-period data from Books or a second query), or can we show only the current values and add trend later?

**Answer:** Out of scope for this spec; show current values only; trend can be added later.

### Existing Code to Reference

- **Performance page:** `app/dashboard/performance/page.tsx` — uses MetricCard (placeholder values), ChannelChart (mock `channelData`), OrdersTable (mock `orders`). Remove OrdersTable; drive KPIs and chart from API.
- **Channel chart:** `components/charts/channel-chart.tsx` — imports `channelData` from `lib/mock-data`; refactor to accept data as props from API.
- **Orders table:** `components/tables/orders-table.tsx` — only used on Performance page; delete component and remove from page.
- **Zoho:** `lib/zoho/reports.ts` already lists invoices and fetches details for sales-by-item; extend or add performance summary that aggregates by total and by month (and by channel if convention exists). Reuse config and token.

### Follow-up Questions

None; scope is clear.

## Requirements Summary

### Functional Requirements

- Remove the Orders table and card from the Performance page; delete the OrdersTable component; remove unused `orders` from mock-data.
- Add a server-side data source (and GET `/api/performance`) that uses Zoho Books Invoices **for the last 12 months only** (Zoho `date_start`/`date_end`) to compute total revenue, order count, average order value, and revenue by month (and optionally wholesale/retail by month if Books supports a channel convention). Response includes `dateRange: { start, end }` so the UI can display the period.
- Performance page fetches from this API and displays KPIs and Channel Breakdown from real data; support loading and error states.
- **Date range display**: Show the period the data represents (e.g. "Last 12 months" or formatted "Mar 2, 2024 – Mar 2, 2025") on the Performance page near the title or above the KPI cards. A date-range selector (picker/dropdown) is out of scope and can be added later.
- ChannelChart receives data via props (no mock-data import); support single-series (revenue) or dual-series (wholesale/retail) from API.

### Scope Boundaries

**In scope:** Performance page only; new performance API route; Zoho Books invoice aggregation for summary and by-month data; remove Orders table and related component/mock; ChannelChart refactor to use API data.

**Out of scope:** "Vs last year" trend; other pages; order list replacement; defining Books channel convention (allow revenue-only until convention exists); **date-range selector** (e.g. dropdown/picker to change the period—display only in this spec).

### Technical Considerations

- Reuse existing Zoho Books config, token, and error handling. List invoices endpoint supports `date_start` and `date_end` (yyyy-mm-dd); use last 12 months to limit pages and improve response time. Aggregate for KPIs and group by month for chart.
- API returns `dateRange: { start, end }` (yyyy-mm-dd) so the Performance page can display the period (e.g. "Last 12 months" or formatted range).
- If channel is not in Books, API returns `revenueByMonth: { month, revenue }[]`; chart shows single series. If channel is available later, extend API to return wholesale/retail per month and chart shows stacked bars as today.
