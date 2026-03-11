import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const mockFetchZohoBooksItems = vi.fn()
vi.mock("@/lib/zoho/books-items", () => ({
  fetchZohoBooksItems: (...args: unknown[]) =>
    mockFetchZohoBooksItems(...args),
}))

const mockFetchZohoSalesByItemReport = vi.fn()
vi.mock("@/lib/zoho/reports", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/zoho/reports")>()
  return {
    ...actual,
    fetchZohoSalesByItemReport: (...args: unknown[]) =>
      mockFetchZohoSalesByItemReport(...args),
  }
})

async function loadRoute() {
  const { GET } = await import("@/app/api/products/route")
  return GET
}

describe("GET /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchZohoSalesByItemReport.mockResolvedValue({
      ok: false,
      message: "Failed to fetch sales report from Zoho",
    })
  })

  it("returns 200 and an array of products when Zoho returns items", async () => {
    mockFetchZohoBooksItems.mockResolvedValueOnce({
      ok: true,
      items: [
        {
          item_id: "1",
          name: "Test Bar",
          sku: "BAR-01",
          rate: 80,
          status: "active",
        },
      ],
    })
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/products")
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({
      id: "1",
      name: "Test Bar",
      sku: "BAR-01",
      price: 80,
      status: "active",
    })
  })

  it("filters products by search query (name)", async () => {
    mockFetchZohoBooksItems.mockResolvedValueOnce({
      ok: true,
      items: [
        { item_id: "1", name: "Mini Pack", sku: "MINI-01", rate: 20, status: "active" },
        { item_id: "2", name: "Large Box", sku: "BOX-01", rate: 100, status: "active" },
      ],
    })
    const GET = await loadRoute()
    const request = new NextRequest(
      "http://localhost:3000/api/products?search=mini"
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe("Mini Pack")
  })

  it("excludes items without SKU or with zero price", async () => {
    mockFetchZohoBooksItems.mockResolvedValueOnce({
      ok: true,
      items: [
        { item_id: "1", name: "Valid", sku: "SKU-1", rate: 50, status: "active" },
        { item_id: "2", name: "No SKU", sku: "", rate: 10, status: "active" },
        { item_id: "3", name: "Zero Price", sku: "SKU-3", rate: 0, status: "active" },
      ],
    })
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/products")
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe("Valid")
  })

  it("returns 502 and generic error when Zoho API fails", async () => {
    mockFetchZohoBooksItems.mockResolvedValueOnce({
      ok: false,
      message: "Failed to fetch items from Zoho",
    })
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/products")
    const response = await GET(request)
    expect(response.status).toBe(502)
    const data = await response.json()
    expect(data).toHaveProperty("error", "Products unavailable. Please try again later.")
    expect(JSON.stringify(data)).not.toMatch(/zoho|client_id|refresh_token|secret/i)
  })

  it("returns 503 and generic error when Zoho credentials not configured", async () => {
    mockFetchZohoBooksItems.mockResolvedValueOnce({
      ok: false,
      message: "Zoho credentials not configured",
    })
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/products")
    const response = await GET(request)
    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data.error).toBe("Products unavailable. Please try again later.")
    expect(JSON.stringify(data)).not.toMatch(/ZOHO_|client_id|refresh_token|secret/i)
  })

  it("includes quantitySold and amount when report data exists", async () => {
    mockFetchZohoBooksItems.mockResolvedValueOnce({
      ok: true,
      items: [
        {
          item_id: "1",
          name: "Test Bar",
          sku: "BAR-01",
          rate: 80,
          status: "active",
        },
      ],
    })
    mockFetchZohoSalesByItemReport.mockResolvedValueOnce({
      ok: true,
      rows: [
        {
          item_id: "1",
          sku: "BAR-01",
          quantity_sold: 100,
          amount: 8000,
          average_price: 80,
        },
      ],
    })
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/products")
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
      quantitySold: 100,
      amount: 8000,
    })
  })

  it("returns 200 with null stats when report fetch fails", async () => {
    mockFetchZohoBooksItems.mockResolvedValueOnce({
      ok: true,
      items: [
        {
          item_id: "1",
          name: "Test Bar",
          sku: "BAR-01",
          rate: 80,
          status: "active",
        },
      ],
    })
    mockFetchZohoSalesByItemReport.mockResolvedValueOnce({
      ok: false,
      message: "Failed to fetch sales report from Zoho",
    })
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/products")
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
    })
    expect(data[0].quantitySold).toBeNull()
    expect(data[0].amount).toBeNull()
  })

  it("search and base product shape unchanged when report is used", async () => {
    mockFetchZohoBooksItems.mockResolvedValueOnce({
      ok: true,
      items: [
        { item_id: "1", name: "Mini Pack", sku: "MINI-01", rate: 20, status: "active" },
        { item_id: "2", name: "Large Box", sku: "BOX-01", rate: 100, status: "active" },
      ],
    })
    mockFetchZohoSalesByItemReport.mockResolvedValueOnce({
      ok: true,
      rows: [
        { item_id: "1", sku: "MINI-01", quantity_sold: 5, amount: 100, average_price: 20 },
        { item_id: "2", sku: "BOX-01", quantity_sold: 2, amount: 200, average_price: 100 },
      ],
    })
    const GET = await loadRoute()
    const request = new NextRequest("http://localhost:3000/api/products?search=mini")
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe("Mini Pack")
    expect(data[0].quantitySold).toBe(5)
    expect(data[0].amount).toBe(100)
  })
})
