# Task Group 3 Implementation: Products page wiring and UI

## Summary

Wired the Products page to GET `/api/products`: fetch on load, loading skeleton, error state, search-only filtering, master-data columns (Product, SKU, Price, Status), empty state, and expandable row with ProductDetail. Removed Category and Status filters.

## Deliverables

### 3.1 Fetch from API
- `app/dashboard/products/page.tsx`: `useEffect` fetches `/api/products` on mount, parses JSON as `ApiProduct[]`, stores in state. Cancellation on unmount to avoid state updates after unmount.

### 3.2 Loading state
- While `loading` is true (and no error), five `Skeleton` rows are shown so the user sees that data is loading.

### 3.3 Error state
- On non-2xx or fetch failure, `error` state is set; UI shows: "Unable to load products. Please try again later." (no Zoho or server details).

### 3.4 Remove Category and Status filters
- Removed `category`, `status` state and both `Select` dropdowns. Only the search input remains. Filtering is client-side by product name and SKU.

### 3.5 Table columns
- Columns: **Product** (name), **SKU**, **Price** (formatted as currency or "—"), **Status** (Active/Inactive badge). Units Sold, Revenue, Avg Price, Last Sale, and Category are omitted for this iteration.

### 3.6 Search and empty state
- Search input filters the list by name and SKU (case-insensitive). When `filtered.length === 0`: show "No products match your search." when search has input, otherwise "No products found." Table is hidden when there are no rows.

### 3.7 Expandable row and ProductDetail
- Row click toggles expand/collapse; `expandedId` is `string | null` (product id from API). Expanded row renders `ProductDetail` with `productId={product.id}` and `monthlySales={MOCK_MONTHLY_SALES}` (12 zeros; chart data from Zoho is out of scope). `ProductDetail` prop `productId` updated to `string | number` for compatibility with Zoho string ids.

### Other
- Fixed React key warning: each product block is wrapped in `<Fragment key={product.id}>` containing the main row and the optional detail row.

## Notes

- Export/Download button was removed (was tied to mock columns); can be re-added in a later iteration when more data is available.
- Sort by column was removed for this iteration (master-data only); can be re-added when needed.
