/**
 * Zoho server-side configuration.
 * Only use in server code (API routes, server components). Never expose to client.
 */

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN
const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI ?? "http://localhost:3000"
const ZOHO_ACCOUNTS_BASE = process.env.ZOHO_ACCOUNTS_BASE ?? "https://accounts.zoho.com"
const ZOHO_BOOKS_BASE = process.env.ZOHO_BOOKS_BASE ?? "https://www.zohoapis.com/books/v3"
const ZOHO_INVENTORY_BASE = process.env.ZOHO_INVENTORY_BASE ?? "https://www.zohoapis.com/inventory/v1"
const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID

export function getZohoConfig() {
  if (!ZOHO_CLIENT_ID?.trim()) {
    throw new Error("ZOHO_CLIENT_ID is not set")
  }
  if (!ZOHO_CLIENT_SECRET?.trim()) {
    throw new Error("ZOHO_CLIENT_SECRET is not set")
  }
  if (!ZOHO_REFRESH_TOKEN?.trim()) {
    throw new Error("ZOHO_REFRESH_TOKEN is not set")
  }
  return {
    clientId: ZOHO_CLIENT_ID.trim(),
    clientSecret: ZOHO_CLIENT_SECRET.trim(),
    refreshToken: ZOHO_REFRESH_TOKEN.trim(),
    redirectUri: ZOHO_REDIRECT_URI.trim(),
    accountsBase: ZOHO_ACCOUNTS_BASE.replace(/\/$/, ""),
    booksBase: ZOHO_BOOKS_BASE.replace(/\/$/, ""),
    inventoryBase: ZOHO_INVENTORY_BASE.replace(/\/$/, ""),
    organizationId: ZOHO_ORGANIZATION_ID?.trim() || undefined,
  }
}

export function isZohoConfigured(): boolean {
  return Boolean(
    ZOHO_CLIENT_ID?.trim() &&
      ZOHO_CLIENT_SECRET?.trim() &&
      ZOHO_REFRESH_TOKEN?.trim()
  )
}
