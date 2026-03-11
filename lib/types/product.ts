/**
 * Shared product type for the dashboard API and frontend.
 * Used by GET /api/products (Zoho Books), GET /api/inventory/products (Zoho Inventory), and the Products page.
 * Stats (quantitySold, amount) come from Zoho Books or Zoho Inventory when available.
 */
export interface ApiProduct {
  id: string
  name: string
  sku: string | null
  price: number | null
  status: "active" | "inactive"
  /** Total quantity sold; from Zoho Books or Zoho Inventory, null when report data missing */
  quantitySold?: number | null
  /** Total revenue (amount); from Zoho Books or Zoho Inventory, null when report data missing */
  amount?: number | null
}
