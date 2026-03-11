import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetchZohoInventoryItems = vi.fn()
const mockFetchZohoInventorySalesByItemReport = vi.fn()

vi.mock("@/lib/zoho/inventory-items", () => ({
  fetchZohoInventoryItems: (...args: unknown[]) =>
    mockFetchZohoInventoryItems(...args),
}))

vi.mock("@/lib/zoho/inventory-reports", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/zoho/inventory-reports")>()
  return {
    ...actual,
    fetchZohoInventorySalesByItemReport: (...args: unknown[]) =>
      mockFetchZohoInventorySalesByItemReport(...args),
  }
})

async function loadPipeline() {
  return import("@/lib/inventory/build-products-from-zoho")
}

describe("buildProductsFromZoho", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchZohoInventorySalesByItemReport.mockResolvedValue({
      ok: false,
      message: "Failed to fetch sales report",
    })
  })

  it("returns [] when Zoho items fetch fails", async () => {
    mockFetchZohoInventoryItems.mockResolvedValueOnce({
      ok: false,
      message: "Failed to fetch items from Zoho",
    })
    const { buildProductsFromZoho } = await loadPipeline()
    const result = await buildProductsFromZoho()
    expect(result).toEqual([])
    expect(mockFetchZohoInventorySalesByItemReport).not.toHaveBeenCalled()
  })

  it("returns [] when Zoho items returns no items", async () => {
    mockFetchZohoInventoryItems.mockResolvedValueOnce({
      ok: true,
      items: [],
    })
    const { buildProductsFromZoho } = await loadPipeline()
    const result = await buildProductsFromZoho()
    expect(result).toEqual([])
  })

  it("maps items to ApiProduct and filters by hasValidSkuAndPrice", async () => {
    mockFetchZohoInventoryItems.mockResolvedValueOnce({
      ok: true,
      items: [
        {
          item_id: "1",
          name: "Valid Bar",
          sku: "BAR-01",
          rate: 80,
          status: "active",
        },
        {
          item_id: "2",
          name: "No SKU",
          sku: "",
          rate: 10,
          status: "active",
        },
        {
          item_id: "3",
          name: "No Price",
          sku: "SKU-3",
          rate: 0,
          status: "active",
        },
      ],
    })
    const { buildProductsFromZoho } = await loadPipeline()
    const result = await buildProductsFromZoho()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: "1",
      name: "Valid Bar",
      sku: "BAR-01",
      price: 80,
      status: "active",
    })
  })

  it("merges sales report into products (quantitySold, amount) when report succeeds", async () => {
    mockFetchZohoInventoryItems.mockResolvedValueOnce({
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
    mockFetchZohoInventorySalesByItemReport.mockResolvedValueOnce({
      ok: true,
      rows: [
        {
          item_id: "1",
          sku: "BAR-01",
          quantity_sold: 100,
          amount: 8000,
        },
      ],
    })
    const { buildProductsFromZoho } = await loadPipeline()
    const result = await buildProductsFromZoho()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: "1",
      name: "Test Bar",
      sku: "BAR-01",
      price: 80,
      status: "active",
      quantitySold: 100,
      amount: 8000,
    })
  })

  it("products without report rows have null quantitySold and amount", async () => {
    mockFetchZohoInventoryItems.mockResolvedValueOnce({
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
    mockFetchZohoInventorySalesByItemReport.mockResolvedValueOnce({
      ok: false,
      message: "Failed to fetch sales report",
    })
    const { buildProductsFromZoho } = await loadPipeline()
    const result = await buildProductsFromZoho()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: "1",
      name: "Test Bar",
      sku: "BAR-01",
      price: 80,
      status: "active",
    })
    expect(result[0].quantitySold).toBeNull()
    expect(result[0].amount).toBeNull()
  })
})
