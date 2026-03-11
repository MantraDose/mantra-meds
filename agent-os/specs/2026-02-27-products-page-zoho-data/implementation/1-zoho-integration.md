# Task Group 1 Implementation: Zoho client and token flow

## Summary

Implemented server-only Zoho integration: config with env checks, OAuth token refresh, and Zoho Inventory Items fetch. Added setup documentation and updated `.env.example`.

## Deliverables

### 1.1 Env variable checks
- **`lib/zoho/config.ts`**: `getZohoConfig()` reads `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`; throws clear errors if any are missing (e.g. "ZOHO_CLIENT_ID is not set") without exposing values. Optional: `ZOHO_REDIRECT_URI`, `ZOHO_ACCOUNTS_BASE`, `ZOHO_INVENTORY_BASE`, `ZOHO_INVENTORY_ORGANIZATION_ID`. `isZohoConfigured()` for safe checks.

### 1.2 OAuth token refresh
- **`lib/zoho/token.ts`**: `getZohoAccessToken()` uses refresh token to POST to `{accountsBase}/oauth/v2/token`; returns access token; on failure throws with a safe message (no credentials in error).

### 1.3 Zoho Inventory Items fetch
- **`lib/zoho/inventory.ts`**: `fetchZohoInventoryItems()` gets access token via 1.2, then GET `{inventoryBase}/api/v1/items` with `Zoho-oauthtoken` header. Returns `{ ok: true, items }` or `{ ok: false, message }`. Zoho/credential errors mapped to generic messages.

### 1.4 Documentation
- **`agent-os/specs/2026-02-27-products-page-zoho-data/ZOHO-SETUP.md`**: Steps to create Server-based client, run OAuth flow for refresh token, set env vars; references Zoho OAuth and List Items docs.
- **`.env.example`**: Added `ZOHO_REFRESH_TOKEN`, `ZOHO_REDIRECT_URI`, and optional Zoho vars with comments.

## Notes

- Zoho Inventory list endpoint may return pagination; current code assumes a single-page response. Pagination can be added in a follow-up if needed.
- Zoho item response shape may use different keys (e.g. `rate` vs `selling_rate`); API route in Group 2 will map to the shared product type.
