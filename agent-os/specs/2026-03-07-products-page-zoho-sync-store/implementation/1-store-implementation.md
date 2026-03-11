# Task Group 1: Products store (Supabase table) — Implementation

## Summary

- **1.1** Added `lib/inventory/store.test.ts` with 9 focused tests (get empty, get with data, get on error, numeric id handling, set then get, full refresh overwrite, empty array no insert, delete failure, insert failure). All tests mock `@/lib/supabase/service`.
- **1.2** Added `agent-os/specs/2026-03-07-products-page-zoho-sync-store/implementation/1-store-migration-sql.md` with table schema, `ALTER TABLE` for existing tables (add name, sku, price, status, quantity_sold, amount), and optional `CREATE TABLE` from scratch.
- **1.3** Implemented:
  - `lib/supabase/service.ts`: `createSupabaseServiceClient()` using `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` and auth options for server-only use.
  - `lib/inventory/store.ts`: `SYNCED_INVENTORY_PRODUCTS_TABLE`, `getProductsFromStore()`, `setProductsInStore()`. Full refresh: delete all (`.delete().neq('id', 0)`), then insert. Id supported as text or int8 (numeric string ids converted to number for insert).
  - `.env.example`: documented `SUPABASE_SERVICE_ROLE_KEY`.
- **1.4** Store tests run and pass: `pnpm test:run -- lib/inventory/store.test.ts` (9 tests).

## Your table

Your `synced_inventory_products` table currently has `id` (int8) and `created_at`. Run the following in Supabase Dashboard → SQL Editor to add the required columns:

```sql
ALTER TABLE synced_inventory_products
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS quantity_sold numeric,
  ADD COLUMN IF NOT EXISTS amount numeric;
```

After that, the store and cron (later) can read/write the table. No code changes needed for int8 `id`; the store converts numeric string ids to number on insert and stringifies on read.

## Files touched

- `lib/supabase/service.ts` — new
- `lib/inventory/store.ts` — new
- `lib/inventory/store.test.ts` — new
- `agent-os/specs/2026-03-07-products-page-zoho-sync-store/implementation/1-store-migration-sql.md` — new
- `.env.example` — added `SUPABASE_SERVICE_ROLE_KEY`
