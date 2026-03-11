import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSelect = vi.fn()
const mockDelete = vi.fn()
const mockInsert = vi.fn()

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceClient: () => ({
    from: () => ({
      select: (cols: string) => {
        return mockSelect(cols)
      },
      delete: () => ({
        neq: () => mockDelete(),
      }),
      insert: (rows: unknown) => mockInsert(rows),
    }),
  }),
}))

async function loadStore() {
  return import("@/lib/inventory/store")
}

describe("getProductsFromStore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockResolvedValue({ data: [], error: null })
  })

  it("returns empty array when table is empty", async () => {
    const { getProductsFromStore } = await loadStore()
    const result = await getProductsFromStore()
    expect(result).toEqual([])
    expect(mockSelect).toHaveBeenCalledWith(
      "id, name, sku, price, status, quantity_sold, amount"
    )
  })

  it("returns mapped ApiProduct[] when store has data", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          id: "1",
          name: "Test Bar",
          sku: "BAR-01",
          price: 80,
          status: "active",
          quantity_sold: 10,
          amount: 800,
        },
      ],
      error: null,
    })
    const { getProductsFromStore } = await loadStore()
    const result = await getProductsFromStore()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: "1",
      name: "Test Bar",
      sku: "BAR-01",
      price: 80,
      status: "active",
      quantitySold: 10,
      amount: 800,
    })
  })

  it("returns empty array when Supabase returns error", async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: "Connection failed" },
    })
    const { getProductsFromStore } = await loadStore()
    const result = await getProductsFromStore()
    expect(result).toEqual([])
  })

  it("handles numeric id from DB (int8) by converting to string", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          id: 12345,
          name: "Numeric Id",
          sku: "NUM-1",
          price: 5,
          status: "active",
          quantity_sold: null,
          amount: null,
        },
      ],
      error: null,
    })
    const { getProductsFromStore } = await loadStore()
    const result = await getProductsFromStore()
    expect(result[0].id).toBe("12345")
  })
})

describe("setProductsInStore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDelete.mockResolvedValue({ error: null })
    mockInsert.mockResolvedValue({ error: null })
  })

  it("calls delete then insert with mapped rows", async () => {
    const { setProductsInStore } = await loadStore()
    const products = [
      {
        id: "1",
        name: "A",
        sku: "SKU-1",
        price: 10,
        status: "active" as const,
        quantitySold: 5,
        amount: 50,
      },
    ]
    await setProductsInStore(products)
    expect(mockDelete).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalledWith([
      {
        id: "1",
        name: "A",
        sku: "SKU-1",
        price: 10,
        status: "active",
        quantity_sold: 5,
        amount: 50,
      },
    ])
  })

  it("overwrite replaces previous data (full refresh)", async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [
          {
            id: "1",
            name: "Old",
            sku: "O",
            price: 1,
            status: "active",
            quantity_sold: null,
            amount: null,
          },
        ],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: "2",
            name: "New",
            sku: "N",
            price: 2,
            status: "inactive",
            quantity_sold: 0,
            amount: 0,
          },
        ],
        error: null,
      })
    const { getProductsFromStore, setProductsInStore } = await loadStore()
    const before = await getProductsFromStore()
    expect(before).toHaveLength(1)
    expect(before[0].name).toBe("Old")

    await setProductsInStore([
      {
        id: "2",
        name: "New",
        sku: "N",
        price: 2,
        status: "inactive",
        quantitySold: 0,
        amount: 0,
      },
    ])

    mockSelect.mockResolvedValueOnce({
      data: [
        {
          id: "2",
          name: "New",
          sku: "N",
          price: 2,
          status: "inactive",
          quantity_sold: 0,
          amount: 0,
        },
      ],
      error: null,
    })
    const after = await getProductsFromStore()
    expect(after).toHaveLength(1)
    expect(after[0].name).toBe("New")
    expect(after[0].id).toBe("2")
  })

  it("does not call insert when products array is empty", async () => {
    const { setProductsInStore } = await loadStore()
    await setProductsInStore([])
    expect(mockDelete).toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it("throws when delete fails", async () => {
    mockDelete.mockResolvedValueOnce({ error: { message: "Delete failed" } })
    const { setProductsInStore } = await loadStore()
    await expect(setProductsInStore([{ id: "1", name: "X", sku: "x", price: 1, status: "active" }])).rejects.toThrow(
      "Failed to clear products store"
    )
  })

  it("throws when insert fails", async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: "Insert failed" } })
    const { setProductsInStore } = await loadStore()
    await expect(
      setProductsInStore([{ id: "1", name: "X", sku: "x", price: 1, status: "active" }])
    ).rejects.toThrow("Failed to write products store")
  })
})
