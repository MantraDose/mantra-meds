import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetchZohoPerformanceSummary = vi.fn()
vi.mock("@/lib/zoho/performance", () => ({
  fetchZohoPerformanceSummary: (...args: unknown[]) =>
    mockFetchZohoPerformanceSummary(...args),
}))

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}))

async function loadRoute() {
  const { GET } = await import("@/app/api/performance/route")
  return GET
}

const validSummary = {
  totalRevenue: 100000,
  totalOrders: 500,
  averageOrderValue: 200,
  revenueByMonth: [
    { month: "Jan 25", revenue: 8000 },
    { month: "Feb 25", revenue: 9200 },
  ],
  dateRange: { start: "2025-01-01", end: "2025-02-28" },
}

describe("GET /api/performance", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 200 and performance summary when Zoho returns data", async () => {
    mockFetchZohoPerformanceSummary.mockResolvedValueOnce({
      ok: true,
      data: validSummary,
    })
    const GET = await loadRoute()
    const response = await GET(new Request("http://localhost:3000/api/performance"))
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({
      totalRevenue: 100000,
      totalOrders: 500,
      averageOrderValue: 200,
      revenueByMonth: [
        { month: "Jan 25", revenue: 8000 },
        { month: "Feb 25", revenue: 9200 },
      ],
      dateRange: { start: "2025-01-01", end: "2025-02-28" },
    })
  })

  it("returns 502 and generic error when Zoho API fails", async () => {
    mockFetchZohoPerformanceSummary.mockResolvedValueOnce({
      ok: false,
      message: "Failed to fetch performance data from Zoho",
    })
    const GET = await loadRoute()
    const response = await GET(new Request("http://localhost:3000/api/performance"))
    expect(response.status).toBe(502)
    const data = await response.json()
    expect(data).toHaveProperty(
      "error",
      "Performance data unavailable. Please try again later."
    )
    expect(JSON.stringify(data)).not.toMatch(/zoho|client_id|refresh_token|secret/i)
  })

  it("returns 503 and generic error when Zoho credentials not configured", async () => {
    mockFetchZohoPerformanceSummary.mockResolvedValueOnce({
      ok: false,
      message: "Zoho credentials not configured",
    })
    const GET = await loadRoute()
    const response = await GET(new Request("http://localhost:3000/api/performance"))
    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data.error).toBe("Performance data unavailable. Please try again later.")
    expect(JSON.stringify(data)).not.toMatch(/ZOHO_|client_id|refresh_token|secret/i)
  })

  it("returns 503 when message includes 'not set'", async () => {
    mockFetchZohoPerformanceSummary.mockResolvedValueOnce({
      ok: false,
      message: "ZOHO_CLIENT_ID is not set",
    })
    const GET = await loadRoute()
    const response = await GET(new Request("http://localhost:3000/api/performance"))
    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data.error).toBe("Performance data unavailable. Please try again later.")
  })
})
