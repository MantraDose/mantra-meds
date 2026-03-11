import { describe, it, expect } from "vitest"
import {
  mergeSalesReportIntoProducts,
  type SalesByItemRow,
} from "@/lib/zoho/reports"
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

function row(overrides: Partial<SalesByItemRow> = {}): SalesByItemRow {
  return {
    item_id: "1",
    sku: "SKU-01",
    quantity_sold: 100,
    amount: 1000,
    average_price: 10,
    ...overrides,
  }
}

describe("mergeSalesReportIntoProducts", () => {
  it("merges report row by item_id into product", () => {
    const products: ApiProduct[] = [product({ id: "42", sku: "BAR-01" })]
    const rows: SalesByItemRow[] = [
      row({ item_id: "42", quantity_sold: 50, amount: 500, average_price: 10 }),
    ]
    const result = mergeSalesReportIntoProducts(products, rows)
    expect(result).toHaveLength(1)
    expect(result[0].quantitySold).toBe(50)
    expect(result[0].amount).toBe(500)
  })

  it("merges report row by sku when item_id does not match", () => {
    const products: ApiProduct[] = [product({ id: "99", sku: "GUM-20" })]
    const rows: SalesByItemRow[] = [
      row({
        item_id: "other",
        sku: "GUM-20",
        quantity_sold: 24,
        amount: 240,
        average_price: 10,
      }),
    ]
    const result = mergeSalesReportIntoProducts(products, rows)
    expect(result).toHaveLength(1)
    expect(result[0].quantitySold).toBe(24)
    expect(result[0].amount).toBe(240)
  })

  it("sets null stats when product is not in report", () => {
    const products: ApiProduct[] = [product({ id: "1", sku: "X" })]
    const rows: SalesByItemRow[] = [row({ item_id: "2", sku: "Y" })]
    const result = mergeSalesReportIntoProducts(products, rows)
    expect(result).toHaveLength(1)
    expect(result[0].quantitySold).toBeNull()
    expect(result[0].amount).toBeNull()
  })

  it("returns extended product shape with quantitySold and amount", () => {
    const products: ApiProduct[] = [product()]
    const rows: SalesByItemRow[] = [row()]
    const result = mergeSalesReportIntoProducts(products, rows)
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

  it("prefers item_id match over sku when both exist", () => {
    const products: ApiProduct[] = [product({ id: "A", sku: "SAME" })]
    const rows: SalesByItemRow[] = [
      row({ item_id: "B", sku: "SAME", quantity_sold: 1, amount: 1, average_price: 1 }),
      row({ item_id: "A", sku: "OTHER", quantity_sold: 2, amount: 2, average_price: 2 }),
    ]
    const result = mergeSalesReportIntoProducts(products, rows)
    expect(result[0].quantitySold).toBe(2)
    expect(result[0].amount).toBe(2)
  })

  it("returns empty array when products is empty", () => {
    const result = mergeSalesReportIntoProducts([], [row()])
    expect(result).toEqual([])
  })

  it("treats invalid numeric report values as null", () => {
    const products: ApiProduct[] = [product({ id: "1" })]
    const rows: SalesByItemRow[] = [
      {
        item_id: "1",
        sku: "X",
        quantity_sold: Number.NaN,
        amount: 100,
        average_price: Number.NaN,
      },
    ]
    const result = mergeSalesReportIntoProducts(products, rows)
    expect(result[0].quantitySold).toBeNull()
    expect(result[0].amount).toBe(100)
  })
})
