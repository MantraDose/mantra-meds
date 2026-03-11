# Task Group 3: Products Table Columns and Sorting

**Spec:** 2025-03-02-product-row-basic-stats  
**Completed:** 2025-03-02

## Summary

- **Columns:** Added Quantity Sold, Amount, and Average Price after Price and before Status. All three use right-aligned `TableHead`/`TableCell` with `text-right text-muted-foreground`.
- **Formatting:** `formatQuantitySold` (toLocaleString en-US, 2 decimals), `formatAmount` ($ + toLocaleString, 2 decimals), `formatAveragePrice` ($ + toFixed(2)). Null/NaN shows "—".
- **Sorting:** State `sortBy: 'quantitySold' | 'amount' | null` and `sortDir: 'asc' | 'desc'`. Quantity Sold and Amount headers are clickable (stopPropagation so row expand doesn’t fire); first click sets sort and asc, subsequent toggles direction. Icons: ArrowUpDown when unsorted, ArrowUp/ArrowDown when sorted. Sorted list derived from `filtered`; nulls always sort to the end.
- **Expandable row:** Detail row `TableCell` uses `colSpan={PRODUCT_TABLE_COLUMNS}` (7). Table body iterates over `sorted` instead of `filtered`.
- **Tests:** In `app/dashboard/products/page.test.tsx` added: (1) columns and formatted stats or "—", (2) em dash for null stats, (3) sort by Quantity Sold (asc then desc), (4) expandable row and `td[colspan='7']`. Total products page tests: 8 (4 existing + 4 new).

## Files Touched

- `app/dashboard/products/page.tsx` — Formatters, sort state, `sorted` memo, `handleSortHeader`, three new header cells (two sortable with icons), three new body cells, colspan 7.
- `app/dashboard/products/page.test.tsx` — `mockProductsWithStats`; four new tests for stats columns, null stats, sort, expandable colspan.
