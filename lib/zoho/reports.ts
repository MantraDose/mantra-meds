/**
 * Zoho Books sales-by-item and merge. Server-only; never import in client code.
 * Aggregates invoice line items by item_id to produce quantity_sold and amount per item.
 * @see https://www.zoho.com/books/api/v3/invoices/
 */

import { getZohoAccessToken } from "./token"
import { getZohoConfig } from "./config"
import type { ApiProduct } from "@/lib/types/product"

/** Single row for sales-by-item; match to product by item_id or sku. */
export interface SalesByItemRow {
  item_id?: string
  sku?: string
  quantity_sold: number
  amount: number
  average_price?: number
}

export interface SalesByItemResult {
  ok: true
  rows: SalesByItemRow[]
}

export interface SalesByItemError {
  ok: false
  message: string
}

const INVOICES_PATH = "/invoices"
const MAX_INVOICES_TO_FETCH = 20

interface BooksInvoiceSummary {
  invoice_id: string
  [key: string]: unknown
}

interface BooksLineItem {
  item_id?: string | number
  quantity?: number
  rate?: number
  item_total?: number
  [key: string]: unknown
}

interface BooksInvoiceDetail {
  invoice_id?: string
  line_items?: BooksLineItem[]
  [key: string]: unknown
}

/**
 * Fetch sales-by-item data from Zoho Books by listing invoices and aggregating
 * line items by item_id. Uses booksBase; fetches up to MAX_INVOICES_TO_FETCH
 * invoice details to limit API calls.
 */
export async function fetchZohoSalesByItemReport(): Promise<
  SalesByItemResult | SalesByItemError
> {
  try {
    const accessToken = await getZohoAccessToken()
    const config = getZohoConfig()
    const baseUrl = config.booksBase
    const orgQ = config.organizationId
      ? `?organization_id=${config.organizationId}`
      : ""

    const listUrl = `${baseUrl}${INVOICES_PATH}${orgQ}`
    const listRes = await fetch(listUrl, {
      method: "GET",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
      next: { revalidate: 0 },
    })
    const listData = (await listRes.json().catch(() => ({}))) as
      | { invoices?: BooksInvoiceSummary[] }
      | { code?: number; message?: string }

    if (!listRes.ok) {
      const message =
        typeof (listData as { message?: string }).message === "string"
          ? (listData as { message: string }).message
          : "Failed to fetch sales report"
      if (process.env.NODE_ENV === "development") {
        console.error("[Zoho Books Reports] list invoices error:", listRes.status, listData)
      }
      return { ok: false, message }
    }

    const invoices = Array.isArray((listData as { invoices?: BooksInvoiceSummary[] }).invoices)
      ? (listData as { invoices: BooksInvoiceSummary[] }).invoices
      : []
    const toFetch = invoices.slice(0, MAX_INVOICES_TO_FETCH)

    const agg = new Map<
      string,
      { quantity_sold: number; amount: number }
    >()

    for (const inv of toFetch) {
      const id = inv.invoice_id
      if (!id) continue
      const detailUrl = `${baseUrl}${INVOICES_PATH}/${id}${orgQ}`
      const detailRes = await fetch(detailUrl, {
        method: "GET",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        next: { revalidate: 0 },
      })
      const detailData = (await detailRes.json().catch(() => ({}))) as
        | BooksInvoiceDetail
        | { code?: number; message?: string }

      if (!detailRes.ok || !detailData || Array.isArray(detailData)) continue

      const lineItems = (detailData as BooksInvoiceDetail).line_items
      if (!Array.isArray(lineItems)) continue

      for (const line of lineItems) {
        const itemId =
          line.item_id != null ? String(line.item_id).trim() : ""
        if (!itemId) continue
        const qty =
          typeof line.quantity === "number" && !Number.isNaN(line.quantity)
            ? line.quantity
            : 0
        const amt =
          typeof line.item_total === "number" && !Number.isNaN(line.item_total)
            ? line.item_total
            : typeof line.rate === "number" && typeof line.quantity === "number"
              ? line.rate * line.quantity
              : 0

        const existing = agg.get(itemId) ?? {
          quantity_sold: 0,
          amount: 0,
        }
        agg.set(itemId, {
          quantity_sold: existing.quantity_sold + qty,
          amount: existing.amount + amt,
        })
      }
    }

    const rows: SalesByItemRow[] = []
    for (const [item_id, v] of agg) {
      rows.push({
        item_id,
        quantity_sold: v.quantity_sold,
        amount: v.amount,
      })
    }

    return { ok: true, rows }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (process.env.NODE_ENV === "development") {
      console.error("[Zoho Books Reports] fetchZohoSalesByItemReport error:", message)
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
    return { ok: false, message: "Failed to fetch sales report from Zoho" }
  }
}

/**
 * Merge sales-by-item rows into products. Match by item_id (product.id) or sku.
 * Products not in the report keep null stats.
 */
export function mergeSalesReportIntoProducts(
  products: ApiProduct[],
  rows: SalesByItemRow[]
): ApiProduct[] {
  const byItemId = new Map<string, SalesByItemRow>()
  const bySku = new Map<string, SalesByItemRow>()
  for (const row of rows) {
    const id = row.item_id != null ? String(row.item_id).trim() : ""
    const sku = row.sku != null ? String(row.sku).trim() : ""
    if (id) byItemId.set(id, row)
    if (sku) bySku.set(sku, row)
  }

  return products.map((p) => {
    const row =
      byItemId.get(p.id) ??
      (p.sku ? bySku.get(p.sku) : undefined)
    if (!row) {
      return {
        ...p,
        quantitySold: null,
        amount: null,
      }
    }
    const qty =
      typeof row.quantity_sold === "number" && !Number.isNaN(row.quantity_sold)
        ? row.quantity_sold
        : null
    const amount =
      typeof row.amount === "number" && !Number.isNaN(row.amount)
        ? row.amount
        : null
    return {
      ...p,
      quantitySold: qty,
      amount,
    }
  })
}
