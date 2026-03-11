import { NextRequest } from "next/server"
import { buildProductsFromZoho } from "@/lib/inventory/build-products-from-zoho"
import { setProductsInStore } from "@/lib/inventory/store"

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const authHeader = request.headers.get("authorization")
  if (authHeader === `Bearer ${secret}`) return true
  const querySecret = request.nextUrl.searchParams.get("secret")
  return querySecret === secret
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const products = await buildProductsFromZoho()
    await setProductsInStore(products)
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return Response.json(
      { error: "Sync failed. Please try again later." },
      { status: 503 }
    )
  }
}
