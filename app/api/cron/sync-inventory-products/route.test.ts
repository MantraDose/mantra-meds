import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const mockBuildProductsFromZoho = vi.fn()
const mockSetProductsInStore = vi.fn()

vi.mock("@/lib/inventory/build-products-from-zoho", () => ({
  buildProductsFromZoho: (...args: unknown[]) => mockBuildProductsFromZoho(...args),
}))

vi.mock("@/lib/inventory/store", () => ({
  setProductsInStore: (...args: unknown[]) => mockSetProductsInStore(...args),
}))

async function loadRoute() {
  const mod = await import("@/app/api/cron/sync-inventory-products/route")
  return mod.GET
}

describe("GET /api/cron/sync-inventory-products", () => {
  const validSecret = "test-cron-secret-123"

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv("CRON_SECRET", validSecret)
    mockBuildProductsFromZoho.mockResolvedValue([])
    mockSetProductsInStore.mockResolvedValue(undefined)
  })

  it("returns 401 when Authorization header is missing", async () => {
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/cron/sync-inventory-products")
    const response = await GET(request)
    expect(response.status).toBe(401)
    expect(mockBuildProductsFromZoho).not.toHaveBeenCalled()
    expect(mockSetProductsInStore).not.toHaveBeenCalled()
  })

  it("returns 401 when Authorization header is wrong", async () => {
    const GET = await loadRoute()
    const request = new NextRequest(
      "http://localhost:3000/api/cron/sync-inventory-products",
      {
        headers: { authorization: "Bearer wrong-secret" },
      }
    )
    const response = await GET(request)
    expect(response.status).toBe(401)
    expect(mockBuildProductsFromZoho).not.toHaveBeenCalled()
    expect(mockSetProductsInStore).not.toHaveBeenCalled()
  })

  it("returns 401 when CRON_SECRET is not set", async () => {
    vi.stubEnv("CRON_SECRET", undefined)
    const GET = await loadRoute()
    const request = new NextRequest(
      "http://localhost:3000/api/cron/sync-inventory-products",
      {
        headers: { authorization: `Bearer ${validSecret}` },
      }
    )
    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it("with valid auth, calls buildProductsFromZoho and setProductsInStore and returns 200", async () => {
    const products = [
      {
        id: "1",
        name: "Test",
        sku: "SKU-1",
        price: 10,
        status: "active" as const,
        quantitySold: 5,
        amount: 50,
      },
    ]
    mockBuildProductsFromZoho.mockResolvedValueOnce(products)
    const GET = await loadRoute()
    const request = new NextRequest(
      "http://localhost:3000/api/cron/sync-inventory-products",
      {
        headers: { authorization: `Bearer ${validSecret}` },
      }
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
    expect(mockBuildProductsFromZoho).toHaveBeenCalledTimes(1)
    expect(mockSetProductsInStore).toHaveBeenCalledWith(products)
    const body = await response.json()
    expect(body).toEqual({ ok: true })
  })

  it("accepts secret via query param when it matches CRON_SECRET", async () => {
    const GET = await loadRoute()
    const request = new NextRequest(
      `http://localhost:3000/api/cron/sync-inventory-products?secret=${encodeURIComponent(validSecret)}`
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
    expect(mockBuildProductsFromZoho).toHaveBeenCalledTimes(1)
    expect(mockSetProductsInStore).toHaveBeenCalledWith([])
  })

  it("returns 503 with generic message when setProductsInStore throws", async () => {
    mockSetProductsInStore.mockRejectedValueOnce(new Error("DB error"))
    const GET = await loadRoute()
    const request = new NextRequest(
      "http://localhost:3000/api/cron/sync-inventory-products",
      {
        headers: { authorization: `Bearer ${validSecret}` },
      }
    )
    const response = await GET(request)
    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data).toHaveProperty("error")
    expect(data.error).toMatch(/try again later/i)
    expect(data.error).not.toMatch(/DB|store|Zoho|supabase/i)
  })

  it("when buildProductsFromZoho returns [], still calls setProductsInStore with []", async () => {
    mockBuildProductsFromZoho.mockResolvedValueOnce([])
    const GET = await loadRoute()
    const request = new NextRequest(
      "http://localhost:3000/api/cron/sync-inventory-products",
      {
        headers: { authorization: `Bearer ${validSecret}` },
      }
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
    expect(mockSetProductsInStore).toHaveBeenCalledWith([])
  })
})
