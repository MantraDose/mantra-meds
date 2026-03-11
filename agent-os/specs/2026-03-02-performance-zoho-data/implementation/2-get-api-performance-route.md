# Implementation: Task Group 2 — GET /api/performance

## Summary

Added GET `/api/performance` route that calls `fetchZohoPerformanceSummary()` and returns the performance summary as JSON on success, or a generic error payload with 502/503 on failure.

## Files touched

- **Added:** `app/api/performance/route.ts`
  - GET handler: awaits `fetchZohoPerformanceSummary()` from `@/lib/zoho/performance`.
  - Success: returns 200 with `result.data` (PerformanceSummary: totalRevenue, totalOrders, averageOrderValue, revenueByMonth).
  - Failure: 503 when message is "Zoho credentials not configured" or includes "not set"; 502 otherwise. Body: `{ error: "Performance data unavailable. Please try again later." }`. No Zoho errors or credentials in response.
  - No caching in the route; Zoho fetch in performance.ts already uses `next: { revalidate: 0 }`.

## Design notes

- Same error pattern as `app/api/products/route.ts`: isConfig check on result.message, status 503 vs 502, single generic user-facing message.
- Response body on success is the raw PerformanceSummary object so the frontend receives totalRevenue, totalOrders, averageOrderValue, revenueByMonth directly.

## Verification

- Linter: no errors on `app/api/performance/route.ts`.
- Manual check: Call GET `/api/performance` to confirm 200 with expected shape or 502/503 with generic error.
