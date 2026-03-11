# Implementation: Task Group 4 — Tests

## Summary

Added API route tests for GET `/api/performance` and Performance page tests. All tests pass; no Zoho internals or credentials are asserted or exposed.

## Files added

### `app/api/performance/route.test.ts`
- **Mocks:** `@/lib/zoho/performance` (`fetchZohoPerformanceSummary`) and `next/cache` (`unstable_cache` → invokes callback so tests don’t require Next cache).
- **Tests:**
  - Returns 200 and performance summary (totalRevenue, totalOrders, averageOrderValue, revenueByMonth, dateRange) when Zoho returns ok + data.
  - Returns 502 and generic error body when Zoho returns ok: false with API-style message; response body does not contain zoho/client_id/refresh_token/secret.
  - Returns 503 and generic error when message is "Zoho credentials not configured"; body does not contain ZOHO_/client_id/refresh_token/secret.
  - Returns 503 when message includes "not set" (e.g. ZOHO_CLIENT_ID is not set).

### `app/dashboard/performance/page.test.tsx`
- **Mocks:** `global.fetch` to return 200 + mock summary or 502 error.
- **Tests:**
  - Calls `/api/performance` on mount.
  - Does not render Orders table or Export CSV (no "Order ID", no Export CSV button).
  - Shows KPI cards (Total Revenue, Total Orders, Avg Order Value) with correct values after successful fetch.
  - Shows Channel Breakdown section and All / Wholesale / Retail filter buttons.
  - Shows date range when `dateRange` is in the API response (regex for "Mar N, NN – Mar N, NN" or "Last 12 months").
  - Shows error message and Retry button when API returns non-2xx.
  - Retry button triggers a second fetch and shows data on success.

## Verification

- Full suite: **61 tests passed** (8 products route, 7 reports, 8 middleware, 4 performance route, 7 performance page, 8 products page, 5 forgot-password, 9 login, 5 reset-password).
- No test asserts or exposes Zoho credentials or raw error messages.
