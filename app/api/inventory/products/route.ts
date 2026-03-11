import { NextRequest } from "next/server"
import { getProductsFromStore } from "@/lib/inventory/store"
import type { ApiProduct } from "@/lib/types/product"

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

  try {
    const products = await getProductsFromStore()
    const filtered = filterBySearch(products, search)
    return Response.json(filtered, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return Response.json(
      { error: "Products unavailable. Please try again later." },
      { status: 503 }
    )
  }
}
