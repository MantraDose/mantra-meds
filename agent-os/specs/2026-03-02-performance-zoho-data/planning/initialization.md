# Spec Initialization: Performance Page Real Data and Remove Orders

## Spec ID

2026-03-02-performance-zoho-data

## Goal (one line)

Replace Performance page placeholder data with real Zoho Books data (last 12 months), display the date range on the page, and remove the Orders table and card.

## Key Artifacts

- **Backend:** New performance summary from Zoho Books invoices (last 12 months via date_start/date_end) in `lib/zoho/performance.ts`; GET `/api/performance` returns summary plus `dateRange`.
- **Frontend:** `app/dashboard/performance/page.tsx` — fetch API, display date range (e.g. "Last 12 months"), wire KPIs and chart, remove OrdersTable; loading/error states.
- **Components:** `ChannelChart` — accept data as props; delete `components/tables/orders-table.tsx`; remove `orders` from `lib/mock-data.ts` if unused.

## Out of Scope

- "Vs last year" trend; order list replacement; other pages; defining Zoho Books channel convention (revenue-only chart allowed until convention exists); date-range selector (display only in this spec).
