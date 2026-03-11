/**
 * Synced inventory products store (Supabase). Server-only.
 * Used by GET /api/inventory/products (read) and the cron sync job (write).
 */

import { createSupabaseServiceClient } from "@/lib/supabase/service"
import type { ApiProduct } from "@/lib/types/product"

export const SYNCED_INVENTORY_PRODUCTS_TABLE = "synced_inventory_products"

interface DbRow {
  id: string | number
  name: string | null
  sku: string | null
  price: number | null
  status: string | null
  quantity_sold: number | null
  amount: number | null
}

function rowToApiProduct(row: DbRow): ApiProduct {
  const id = typeof row.id === "number" ? String(row.id) : String(row.id ?? "")
  const status =
    row.status === "active" || row.status === "inactive" ? row.status : "active"
  return {
    id,
    name: typeof row.name === "string" ? row.name : "",
    sku:
      typeof row.sku === "string" && row.sku.trim() ? row.sku.trim() : null,
    price:
      typeof row.price === "number" && !Number.isNaN(row.price)
        ? row.price
        : null,
    status,
    quantitySold:
      typeof row.quantity_sold === "number" && !Number.isNaN(row.quantity_sold)
        ? row.quantity_sold
        : null,
    amount:
      typeof row.amount === "number" && !Number.isNaN(row.amount)
        ? row.amount
        : null,
  }
}

/**
 * Returns all products from the store. Returns [] when table is empty or on error.
 */
export async function getProductsFromStore(): Promise<ApiProduct[]> {
  try {
    const supabase = createSupabaseServiceClient()
    const { data, error } = await supabase
      .from(SYNCED_INVENTORY_PRODUCTS_TABLE)
      .select("id, name, sku, price, status, quantity_sold, amount")

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[inventory store] getProductsFromStore error:", error)
      }
      return []
    }

    if (!Array.isArray(data) || data.length === 0) return []

    return data.map((row: DbRow) => rowToApiProduct(row))
  } catch {
    return []
  }
}

/**
 * Full refresh: replaces all rows in the table with the given products.
 */
export async function setProductsInStore(products: ApiProduct[]): Promise<void> {
  const supabase = createSupabaseServiceClient()

  const rows = products.map((p) => ({
    // Keep id as string to avoid JS number precision loss (Zoho ids can exceed Number.MAX_SAFE_INTEGER)
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: p.price,
    status: p.status,
    quantity_sold: p.quantitySold ?? null,
    amount: p.amount ?? null,
  }))

  const { error: deleteError } = await supabase
    .from(SYNCED_INVENTORY_PRODUCTS_TABLE)
    .delete()
    .neq("id", 0)

  if (deleteError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[inventory store] setProductsInStore delete error:", deleteError)
    }
    throw new Error("Failed to clear products store")
  }

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from(SYNCED_INVENTORY_PRODUCTS_TABLE)
    .insert(rows)

  if (insertError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[inventory store] setProductsInStore insert error:", insertError)
    }
    throw new Error("Failed to write products store")
  }
}
