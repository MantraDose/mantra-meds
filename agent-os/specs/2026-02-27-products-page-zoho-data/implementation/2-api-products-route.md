# Task Group 2 Implementation: GET /api/products

## Summary

Implemented GET `/api/products` with shared product type, Zoho mapping, optional `search` query (server-side filter), and safe error responses.

## Deliverables

### 2.1 Shared product type
- **`lib/types/product.ts`**: `ApiProduct` interface with `id`, `name`, `sku`, `price`, `status`. Used by the API route and intended for the Products page.

### 2.2 GET /api/products
- **`app/api/products/route.ts`**: GET handler calls `fetchZohoInventoryItems()`, maps each Zoho item to `ApiProduct` (item_id → id, rate → price, status normalized to active/inactive), returns JSON array with 200.

### 2.3 Optional search
- **`app/api/products/route.ts`**: Reads `search` query param; filters mapped products by name and SKU (case-insensitive) server-side before returning.

### 2.4 Error handling
- Credentials not configured or env missing → 503, body `{ error: "Products unavailable. Please try again later." }`.
- Zoho API failure → 502, same generic message. No Zoho details or credentials in responses.

## Notes

- Zoho `item_id` may be number in JSON; mapper coerces to string for `id`.
- Zoho `rate` used as selling price; if Zoho uses a different field (e.g. selling_rate), the mapper can be updated.
