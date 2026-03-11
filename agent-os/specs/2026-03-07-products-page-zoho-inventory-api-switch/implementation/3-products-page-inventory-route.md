# Task Group 3: Products Page Data Source and Table — Implementation

**Completed:** 2026-03-07

## Summary

- **Data source:** Products page now fetches from `/api/inventory/products` instead of `/api/products`. Loading, error, and state handling unchanged.
- **Single Product column:** Replaced separate Product and SKU columns with one column: item name on the first line, SKU on the second line in the same cell (flex column, muted text for SKU). No separate SKU column header or cell.
- **Columns:** Product (name + SKU), Price, Quantity Sold, Amount, Status. Null quantitySold/amount display as "—". Status column kept (API returns status).
- **Search, sort, pagination:** Preserved; client-side search by name/SKU, sort by Quantity Sold/Amount, page size 20, "Showing X–Y of Z", prev/next.
- **Tests:** Updated `app/dashboard/products/page.test.tsx`: assert fetch calls `/api/inventory/products`; new test "renders single Product column with name and SKU in same cell"; "renders table with five columns" (Product, Price, Quantity Sold, Amount, Status). Existing tests for search, sort, error, null stats, and quantity/amount columns still pass.

## Files touched

- `app/dashboard/products/page.tsx` — fetch URL, single Product cell (name + SKU), removed SKU column
- `app/dashboard/products/page.test.tsx` — inventory route assertion, single-Product and five-column tests

## Run Products page tests only

```bash
pnpm test:run -- app/dashboard/products/page.test.tsx
```

All 9 tests pass.
