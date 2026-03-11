import { NextRequest } from "next/server"
import { fetchZohoBooksItems } from "@/lib/zoho/books-items"
import type { ZohoBooksItem } from "@/lib/zoho/books-items"
import {
  fetchZohoSalesByItemReport,
  mergeSalesReportIntoProducts,
} from "@/lib/zoho/reports"
import type { ApiProduct } from "@/lib/types/product"

function mapZohoItemToProduct(item: ZohoBooksItem): ApiProduct {
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

function hasValidSkuAndPrice(p: ApiProduct): boolean {
  const hasSku = p.sku != null && String(p.sku).trim() !== ""
  const hasPrice = p.price != null && Number(p.price) > 0
  return hasSku && hasPrice
}

function filterBySearch(items: ApiProduct[], search: string): ApiProduct[] {
  const q = search.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q))
  )
}

export async function GET(request: NextRequest) {
  const searchParam = request.nextUrl.searchParams.get("search")
  const search = typeof searchParam === "string" ? searchParam : ""

  const result = await fetchZohoBooksItems()

  if (!result.ok) {
    const isConfig =
      result.message === "Zoho credentials not configured" ||
      result.message.includes("not set")
    const status = isConfig ? 503 : 502
    return Response.json(
      { error: "Products unavailable. Please try again later." },
      { status }
    )
  }

  const products = result.items
    .map(mapZohoItemToProduct)
    .filter(hasValidSkuAndPrice)

  const reportResult = await fetchZohoSalesByItemReport()
  const rows = reportResult.ok ? reportResult.rows : []
  const productsWithStats = mergeSalesReportIntoProducts(products, rows)
  const filtered = filterBySearch(productsWithStats, search)

  return Response.json(filtered, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
