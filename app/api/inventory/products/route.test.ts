import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const mockGetProductsFromStore = vi.fn()

vi.mock("@/lib/inventory/store", () => ({
  getProductsFromStore: (...args: unknown[]) =>
    mockGetProductsFromStore(...args),
}))

async function loadRoute() {
  const { GET } = await import("@/app/api/inventory/products/route")
  return GET
}

describe("GET /api/inventory/products", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProductsFromStore.mockResolvedValue([])
  })

  it("returns 200 and [] when store is empty", async () => {
    mockGetProductsFromStore.mockResolvedValueOnce([])
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/inventory/products")
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(0)
  })

  it("returns 200 and full array when store has data; no Zoho calls", async () => {
    const products = [
      {
        id: "1",
        name: "Test Bar",
        sku: "BAR-01",
        price: 80,
        status: "active" as const,
        quantitySold: 10,
        amount: 800,
      },
    ]
    mockGetProductsFromStore.mockResolvedValueOnce(products)
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/inventory/products")
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({
      id: "1",
      name: "Test Bar",
      sku: "BAR-01",
      price: 80,
      status: "active",
      quantitySold: 10,
      amount: 800,
    })
  })

  it("filters products by search query (name)", async () => {
    const products = [
      { id: "1", name: "Mini Pack", sku: "MINI-01", price: 20, status: "active" as const },
      { id: "2", name: "Large Box", sku: "BOX-01", price: 100, status: "active" as const },
    ]
    mockGetProductsFromStore.mockResolvedValueOnce(products)
    const GET = await loadRoute()
    const request = new NextRequest(
      "http://localhost:3000/api/inventory/products?search=mini"
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe("Mini Pack")
  })

  it("filters products by search query (SKU)", async () => {
    const products = [
      { id: "1", name: "Mini Pack", sku: "MINI-01", price: 20, status: "active" as const },
      { id: "2", name: "Large Box", sku: "BOX-01", price: 100, status: "active" as const },
    ]
    mockGetProductsFromStore.mockResolvedValueOnce(products)
    const GET = await loadRoute()
    const request = new NextRequest(
      "http://localhost:3000/api/inventory/products?search=box-01"
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(1)
    expect(data[0].sku).toBe("BOX-01")
  })

  it("returns 503 and generic error when store get throws", async () => {
    mockGetProductsFromStore.mockRejectedValueOnce(new Error("Connection failed"))
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/inventory/products")
    const response = await GET(request)
    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data).toHaveProperty("error", "Products unavailable. Please try again later.")
    expect(JSON.stringify(data)).not.toMatch(/connection|store|supabase|zoho/i)
  })

  it("returns 200 with empty array when search matches nothing", async () => {
    const products = [
      { id: "1", name: "Mini Pack", sku: "MINI-01", price: 20, status: "active" as const },
    ]
    mockGetProductsFromStore.mockResolvedValueOnce(products)
    const GET = await loadRoute()
    const request = new NextRequest(
      "http://localhost:3000/api/inventory/products?search=nonexistent"
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(0)
  })
})
