# Task Group 1: Products store (Supabase table) — Migration

## Table name

`synced_inventory_products`

## Schema (target)

| Column         | Type         | Nullable | Notes                    |
|----------------|--------------|----------|--------------------------|
| id             | text         | NOT NULL | Primary key (Zoho item_id) |
| name           | text         | NOT NULL |                          |
| sku            | text         | NULL     |                          |
| price          | numeric      | NULL     |                          |
| status         | text         | NOT NULL | 'active' or 'inactive'   |
| quantity_sold   | numeric      | NULL     |                          |
| amount         | numeric      | NULL     |                          |
| updated_at     | timestamptz  | NULL     | Optional                 |

You can keep `created_at` (timestamptz) if you already have it. The store code does not require it.

## If the table already exists (e.g. with only `id` and `created_at`)

Add the missing columns in Supabase SQL Editor:

```sql
-- Add columns required by the sync store (run in Supabase Dashboard → SQL Editor)
ALTER TABLE synced_inventory_products
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS quantity_sold numeric,
  ADD COLUMN IF NOT EXISTS amount numeric;

-- If your table uses int8 for id, the store supports it (id is cast in app code).
-- To use text id instead (recommended for Zoho string ids):
-- ALTER TABLE synced_inventory_products ALTER COLUMN id TYPE text USING id::text;
```

## If creating the table from scratch

```sql
CREATE TABLE IF NOT EXISTS synced_inventory_products (
  id text PRIMARY KEY,
  name text NOT NULL,
  sku text,
  price numeric,
  status text NOT NULL DEFAULT 'active',
  quantity_sold numeric,
  amount numeric,
  updated_at timestamptz DEFAULT now()
);

-- Optional: add created_at for auditing
-- ALTER TABLE synced_inventory_products ADD COLUMN created_at timestamptz DEFAULT now();
```

## Environment

- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (Supabase Dashboard → Project Settings → API → service_role).
- `NEXT_PUBLIC_SUPABASE_URL` is already used for Auth.
