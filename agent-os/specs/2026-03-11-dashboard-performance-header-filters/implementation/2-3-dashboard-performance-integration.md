# Task Groups 2 & 3 — Dashboard + Performance Integration

## Summary

- **Dashboard** (`app/dashboard/page.tsx`): Replaced inline `h1` + `p` with `<PageHeader title="Dashboard" description="..." actions={<TimeRangeFilter />} />`. Page remains a server component; client header/filter hydrate as a subtree. Metric cards, `RevenueChart`, `TopProductsTable` unchanged.
- **Performance** (`app/dashboard/performance/page.tsx`): Replaced inline header block with `<PageHeader ... actions={<TimeRangeFilter />}>`. API date range line moved into `PageHeader` `children` with `text-xs text-muted-foreground` (same visual as before). `fetch("/api/performance")` unchanged; channel buttons unchanged.

## Verification

- `pnpm exec vitest run app/dashboard/performance/page.test.tsx` — all 7 tests pass (date range, channel buttons, retry, etc.).
- No new query params on performance API.

## Files touched

- `app/dashboard/page.tsx`
- `app/dashboard/performance/page.tsx`
