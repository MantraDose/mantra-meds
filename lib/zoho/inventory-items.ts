/**
 * Zoho Inventory Items API. Server-only; never import in client code.
 * @see https://www.zoho.com/inventory/api/v1/items/
 */

import { getZohoAccessToken } from "./token"
import { getZohoConfig } from "./config"

const ITEMS_PATH = "/items"

/** Single item from Zoho Inventory list items response. */
export interface ZohoInventoryItem {
  item_id: string | number
  name: string
  sku?: string
  status?: "active" | "inactive"
  rate?: number
  [key: string]: unknown
}

export interface ZohoInventoryItemsResponse {
  items: ZohoInventoryItem[]
  [key: string]: unknown
}

export interface ZohoInventoryItemsResult {
  ok: true
  items: ZohoInventoryItem[]
}

export interface ZohoInventoryItemsError {
  ok: false
  message: string
}

/**
 * Fetch all items from Zoho Inventory (List items).
 * Uses the same OAuth token as Books; refresh token must include Inventory scopes.
 * Returns a simple result shape; never exposes credentials or raw Zoho errors to caller.
 */
export async function fetchZohoInventoryItems(): Promise<
  ZohoInventoryItemsResult | ZohoInventoryItemsError
> {
  try {
    const accessToken = await getZohoAccessToken()
    const config = getZohoConfig()
    const baseUrl = `${config.inventoryBase}${ITEMS_PATH}`
    const url = config.organizationId
      ? `${baseUrl}?organization_id=${config.organizationId}`
      : baseUrl
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
      next: { revalidate: 0 },
    })
    const data = (await res.json().catch(() => ({}))) as
      | ZohoInventoryItemsResponse
      | { code?: number; message?: string }

    if (!res.ok) {
      const message =
        typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Failed to fetch items"
      if (process.env.NODE_ENV === "development") {
        console.error("[Zoho Inventory] API error:", res.status, data)
      }
      return { ok: false, message }
    }

    const items = (data as ZohoInventoryItemsResponse).items
    const list = Array.isArray(items) ? items : []
    return { ok: true, items: list }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (process.env.NODE_ENV === "development") {
      console.error("[Zoho Inventory] fetchZohoInventoryItems error:", message)
    }
    if (
      message.includes("ZOHO_CLIENT_ID") ||
      message.includes("ZOHO_CLIENT_SECRET") ||
      message.includes("ZOHO_REFRESH_TOKEN")
    ) {
      return { ok: false, message: "Zoho credentials not configured" }
    }
    if (message.includes("Zoho auth failed")) {
      return { ok: false, message: "Zoho auth failed" }
    }
    return { ok: false, message: "Failed to fetch items from Zoho" }
  }
}
