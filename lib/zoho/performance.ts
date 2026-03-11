/**
 * Zoho Books performance summary. Server-only; never import in client code.
 * Aggregates invoices for total revenue, order count, and revenue by month.
 * @see https://www.zoho.com/books/api/v3/invoices/
 */

import { getZohoAccessToken } from "./token"
import { getZohoConfig } from "./config"

/** One month of revenue for the channel chart. */
export interface RevenueByMonthRow {
  month: string
  revenue: number
}

/** Optional channel breakdown per month (when Books convention exists). */
export interface ChannelByMonthRow {
  month: string
  wholesale: number
  retail: number
}

/** Summary returned by fetchZohoPerformanceSummary. */
export interface PerformanceSummary {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  revenueByMonth: RevenueByMonthRow[]
  /** Date range used for the data (Zoho list-invoices date_start/date_end). UI can show this as "Mar 2, 2024 – Mar 2, 2025". */
  dateRange?: { start: string; end: string }
}

export interface PerformanceSummaryResult {
  ok: true
  data: PerformanceSummary
}

export interface PerformanceSummaryError {
  ok: false
  message: string
}

const INVOICES_PATH = "/invoices"
const PER_PAGE = 200
const MAX_PAGES = 10
/** Only fetch invoices from the last 12 months (fewer pages, faster). */
const MONTHS_TO_FETCH = 12
/** Invoice statuses that represent completed sales (included in revenue). */
const COMPLETED_STATUSES = new Set(["paid", "sent", "viewed"])

function getDateRangeLast12Months(): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - MONTHS_TO_FETCH)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

interface BooksInvoiceListItem {
  invoice_id?: string
  date?: string
  total?: number
  status?: string
  [key: string]: unknown
}

interface BooksInvoicesListResponse {
  invoices?: BooksInvoiceListItem[]
  page_context?: { page?: number; has_more_page?: boolean }
  [key: string]: unknown
}

function parseTotal(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value
  if (typeof value === "string") {
    const n = parseFloat(value)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function parseDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null
  return value.trim()
}

function monthKeyFromDate(dateStr: string): string {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = d.getMonth()
  if (Number.isNaN(d.getTime())) return ""
  const year = y % 100
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[m]} ${String(year).padStart(2, "0")}`
}

function sortMonthKeys(keys: string[]): string[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return keys.slice().sort((a, b) => {
    const [ma, ya] = a.split(" ")
    const [mb, yb] = b.split(" ")
    const yi = parseInt(ya, 10)
    const yj = parseInt(yb, 10)
    const yearA = yi >= 0 && yi <= 99 ? 2000 + yi : yi
    const yearB = yj >= 0 && yj <= 99 ? 2000 + yj : yj
    if (yearA !== yearB) return yearA - yearB
    const mi = months.indexOf(ma)
    const mj = months.indexOf(mb)
    return mi - mj
  })
}

/**
 * Fetch performance summary from Zoho Books by listing invoices and aggregating
 * by total and by month. Uses booksBase; only fetches invoices from the last
 * 12 months (date_start/date_end) so fewer pages are needed. Paginates to cover
 * all invoices in that range. Only invoices with status in COMPLETED_STATUSES
 * (e.g. paid, sent) are included. Channel (wholesale/retail) is not derived;
 * revenueByMonth is revenue-only.
 */
export async function fetchZohoPerformanceSummary(): Promise<
  PerformanceSummaryResult | PerformanceSummaryError
> {
  try {
    const accessToken = await getZohoAccessToken()
    const config = getZohoConfig()
    const baseUrl = config.booksBase
    const orgQ = config.organizationId
      ? `&organization_id=${config.organizationId}`
      : ""

    const dateRange = getDateRangeLast12Months()
    const dateParams = `&date_start=${dateRange.start}&date_end=${dateRange.end}`

    let totalRevenue = 0
    let totalOrders = 0
    const byMonth = new Map<string, number>()
    let page = 1
    let hasMore = true

    while (hasMore && page <= MAX_PAGES) {
      const listUrl = `${baseUrl}${INVOICES_PATH}?page=${page}&per_page=${PER_PAGE}${orgQ}${dateParams}`
      const listRes = await fetch(listUrl, {
        method: "GET",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        next: { revalidate: 0 },
      })
      const listData = (await listRes.json().catch(() => ({}))) as
        | BooksInvoicesListResponse
        | { code?: number; message?: string }

      if (!listRes.ok) {
        const message =
          typeof (listData as { message?: string }).message === "string"
            ? (listData as { message: string }).message
            : "Failed to fetch performance data"
        if (process.env.NODE_ENV === "development") {
          console.error("[Zoho Performance] list invoices error:", listRes.status, listData)
        }
        return { ok: false, message }
      }

      const invoices = Array.isArray((listData as BooksInvoicesListResponse).invoices)
        ? (listData as BooksInvoicesListResponse).invoices
        : []

      for (const inv of invoices) {
        const status =
          typeof inv.status === "string" ? inv.status.toLowerCase().trim() : ""
        if (!COMPLETED_STATUSES.has(status)) continue

        const total = parseTotal(inv.total)
        const dateStr = parseDate(inv.date)
        if (dateStr) {
          totalRevenue += total
          totalOrders += 1
          const key = monthKeyFromDate(dateStr)
          if (key) {
            byMonth.set(key, (byMonth.get(key) ?? 0) + total)
          }
        }
      }

      const pageContext = (listData as BooksInvoicesListResponse).page_context
      hasMore = Boolean(pageContext?.has_more_page)
      page += 1
      if (invoices.length < PER_PAGE) hasMore = false
    }

    const revenueByMonth: RevenueByMonthRow[] = []
    const keys = sortMonthKeys(Array.from(byMonth.keys()))
    for (const key of keys) {
      revenueByMonth.push({ month: key, revenue: byMonth.get(key) ?? 0 })
    }

    const averageOrderValue =
      totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0

    return {
      ok: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        revenueByMonth,
        dateRange,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (process.env.NODE_ENV === "development") {
      console.error("[Zoho Performance] fetchZohoPerformanceSummary error:", message)
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
    return { ok: false, message: "Failed to fetch performance data from Zoho" }
  }
}
