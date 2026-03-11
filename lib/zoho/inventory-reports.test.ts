import { describe, it, expect } from "vitest"
import {
  mergeInventorySalesReportIntoProducts,
  type InventorySalesByItemRow,
} from "@/lib/zoho/inventory-reports"
import type { ApiProduct } from "@/lib/types/product"

function product(overrides: Partial<ApiProduct> = {}): ApiProduct {
  return {
    id: "1",
    name: "Test Product",
    sku: "SKU-01",
    price: 10,
    status: "active",
    ...overrides,
  }
}

function row(
  overrides: Partial<InventorySalesByItemRow> = {}
): InventorySalesByItemRow {
  return {
    item_id: "1",
    sku: "SKU-01",
    quantity_sold: 100,
    amount: 1000,
    ...overrides,
  }
}

describe("mergeInventorySalesReportIntoProducts", () => {
  it("merges report row by item_id into product", () => {
    const products: ApiProduct[] = [product({ id: "42", sku: "BAR-01" })]
    const rows: InventorySalesByItemRow[] = [
      row({ item_id: "42", quantity_sold: 50, amount: 500 }),
    ]
    const result = mergeInventorySalesReportIntoProducts(products, rows)
    expect(result).toHaveLength(1)
    expect(result[0].quantitySold).toBe(50)
    expect(result[0].amount).toBe(500)
  })

  it("merges report row by sku when item_id does not match", () => {
    const products: ApiProduct[] = [product({ id: "99", sku: "GUM-20" })]
    const rows: InventorySalesByItemRow[] = [
      row({
        item_id: "other",
        sku: "GUM-20",
        quantity_sold: 24,
        amount: 240,
      }),
    ]
    const result = mergeInventorySalesReportIntoProducts(products, rows)
    expect(result).toHaveLength(1)
    expect(result[0].quantitySold).toBe(24)
    expect(result[0].amount).toBe(240)
  })

  it("sets null stats when product is not in report", () => {
    const products: ApiProduct[] = [product({ id: "1", sku: "X" })]
    const rows: InventorySalesByItemRow[] = [row({ item_id: "2", sku: "Y" })]
    const result = mergeInventorySalesReportIntoProducts(products, rows)
    expect(result).toHaveLength(1)
    expect(result[0].quantitySold).toBeNull()
    expect(result[0].amount).toBeNull()
  })

  it("returns extended product shape with quantitySold and amount", () => {
    const products: ApiProduct[] = [product()]
    const rows: InventorySalesByItemRow[] = [row()]
    const result = mergeInventorySalesReportIntoProducts(products, rows)
    expect(result[0]).toMatchObject({
      id: "1",
      name: "Test Product",
      sku: "SKU-01",
      price: 10,
      status: "active",
      quantitySold: 100,
      amount: 1000,
    })
  })

  it("returns empty array when products is empty", () => {
    const result = mergeInventorySalesReportIntoProducts([], [row()])
    expect(result).toEqual([])
  })
})

