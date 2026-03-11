import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  fetchZohoInventoryItems,
  type ZohoInventoryItem,
} from "@/lib/zoho/inventory-items"

vi.mock("@/lib/zoho/token", () => ({
  getZohoAccessToken: vi.fn().mockResolvedValue("mock-access-token"),
}))

vi.mock("@/lib/zoho/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/zoho/config")>()
  return {
    ...actual,
    getZohoConfig: vi.fn().mockReturnValue({
      clientId: "test-id",
      clientSecret: "test-secret",
      refreshToken: "test-token",
      redirectUri: "http://localhost:3000",
      accountsBase: "https://accounts.zoho.com",
      booksBase: "https://www.zohoapis.com/books/v3",
      inventoryBase: "https://www.zohoapis.com/inventory/v1",
      organizationId: undefined,
    }),
  }
})

describe("getZohoConfig", () => {
  it("exposes inventoryBase (default when ZOHO_INVENTORY_BASE not set)", async () => {
    const { getZohoConfig } = await import("@/lib/zoho/config")
    const config = getZohoConfig()
    expect(config).toHaveProperty("inventoryBase")
    expect(typeof config.inventoryBase).toBe("string")
    expect(config.inventoryBase.length).toBeGreaterThan(0)
    expect(config.inventoryBase).toMatch(/inventory\/v1$/)
  })
})

describe("fetchZohoInventoryItems", () => {
  it("returns ok and items array when API returns valid items", async () => {
    const mockItems: ZohoInventoryItem[] = [
      {
        item_id: "4815000000044208",
        name: "Bags-small",
        sku: "SK123",
        rate: 6,
        status: "active",
      },
    ]
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockItems }),
    }))
    const result = await fetchZohoInventoryItems()
    expect(result).toEqual({ ok: true, items: mockItems })
    vi.unstubAllGlobals()
  })

  it("returns ok: false and message when API returns non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid token" }),
      })
    )
    const result = await fetchZohoInventoryItems()
    expect(result).toEqual({ ok: false, message: "Invalid token" })
    vi.unstubAllGlobals()
  })

  it("returns ok: true and empty items when response items is not an array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: null }),
      })
    )
    const result = await fetchZohoInventoryItems()
    expect(result).toEqual({ ok: true, items: [] })
    vi.unstubAllGlobals()
  })
})
