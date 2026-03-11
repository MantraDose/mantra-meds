/**
 * Zoho Books Items API. Server-only; never import in client code.
 * @see https://www.zoho.com/books/api/v3/items/
 */

import { getZohoAccessToken } from "./token"
import { getZohoConfig } from "./config"

const ITEMS_PATH = "/items"

/** Single item from Zoho Books list items response. Compatible with ApiProduct mapping. */
export interface ZohoBooksItem {
  item_id: string
  name: string
  sku?: string
  status?: "active" | "inactive"
  rate?: number
  [key: string]: unknown
}

export interface ZohoBooksItemsResponse {
  items: ZohoBooksItem[]
  [key: string]: unknown
}

export interface ZohoItemsResult {
  ok: true
  items: ZohoBooksItem[]
}

export interface ZohoItemsError {
  ok: false
  message: string
}

/**
 * Fetch all items from Zoho Books (List items).
 * Uses refresh token to get access token, then calls the Books API.
 * Returns a simple result shape; never exposes credentials or raw Zoho errors to caller.
 */
export async function fetchZohoBooksItems(): Promise<
  ZohoItemsResult | ZohoItemsError
> {
  try {
    const accessToken = await getZohoAccessToken()
    const config = getZohoConfig()
    const baseUrl = `${config.booksBase}${ITEMS_PATH}`
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
      | ZohoBooksItemsResponse
      | { code?: number; message?: string }

    if (!res.ok) {
      const message =
        typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Failed to fetch items"
      if (process.env.NODE_ENV === "development") {
        console.error("[Zoho Books] API error:", res.status, data)
      }
      return { ok: false, message }
    }

    const items = (data as ZohoBooksItemsResponse).items
    const list = Array.isArray(items) ? items : []
    return { ok: true, items: list }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (process.env.NODE_ENV === "development") {
      console.error("[Zoho Books] fetchZohoBooksItems error:", message)
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
