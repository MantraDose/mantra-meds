/**
 * Build ApiProduct[] from Zoho Inventory (items + sales report). Server-only.
 * Used by the sync job only; GET /api/inventory/products reads from store.
 */

import { fetchZohoInventoryItems } from "@/lib/zoho/inventory-items"
import type { ZohoInventoryItem } from "@/lib/zoho/inventory-items"
import {
  fetchZohoInventorySalesByItemReport,
  mergeInventorySalesReportIntoProducts,
} from "@/lib/zoho/inventory-reports"
import type { ApiProduct } from "@/lib/types/product"

export function mapZohoInventoryItemToProduct(
  item: ZohoInventoryItem
): ApiProduct {
  const id =
    typeof item.item_id === "number"
      ? String(item.item_id)
      : String(item.item_id ?? "")
  const name = typeof item.name === "string" ? item.name : ""
  const sku =
    typeof item.sku === "string" && item.sku.trim() ? item.sku.trim() : null
  const rate = item.rate
  const price =
    typeof rate === "number" && !Number.isNaN(rate) ? rate : null
  const status =
    item.status === "active" || item.status === "inactive"
      ? item.status
      : "active"
  return { id, name, sku, price, status }
}

export function hasValidSkuAndPrice(p: ApiProduct): boolean {
  const hasSku = p.sku != null && String(p.sku).trim() !== ""
  const hasPrice = p.price != null && Number(p.price) > 0
  return hasSku && hasPrice
}

/**
 * Fetches Zoho Inventory items and sales report, maps to ApiProduct,
 * filters by hasValidSkuAndPrice, and merges sales stats. Returns [] on failure.
 */
export async function buildProductsFromZoho(): Promise<ApiProduct[]> {
  const result = await fetchZohoInventoryItems()

  if (!result.ok) return []

  const products = result.items
    .map(mapZohoInventoryItemToProduct)
    .filter(hasValidSkuAndPrice)

  const reportResult = await fetchZohoInventorySalesByItemReport()
  const rows = reportResult.ok ? reportResult.rows : []
  return mergeInventorySalesReportIntoProducts(products, rows)
}
