import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProductsPage from "@/app/dashboard/products/page"

const mockProducts = [
  { id: "1", name: "Product A", sku: "SKU-A", price: 80, status: "active" as const },
  { id: "2", name: "Product B", sku: "SKU-B", price: 60, status: "inactive" as const },
]

const mockProductsWithStats = [
  {
    id: "1",
    name: "Product A",
    sku: "SKU-A",
    price: 80,
    status: "active" as const,
    quantitySold: 100,
    amount: 8000,
  },
  {
    id: "2",
    name: "Product B",
    sku: "SKU-B",
    price: 60,
    status: "inactive" as const,
    quantitySold: 50,
    amount: 3000,
  },
]

describe("Products page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("calls /api/inventory/products on mount", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockProducts), { status: 200 })
    )
    render(<ProductsPage />)
    expect(global.fetch).toHaveBeenCalledWith("/api/inventory/products")
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument()
    })
  })

  it("shows products after successful fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockProducts), { status: 200 })
    )
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument()
    })
    expect(screen.getByText("Product B")).toBeInTheDocument()
  })

  it("shows error message when API returns non-2xx", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Server error" }), { status: 502 })
    )
    render(<ProductsPage />)
    await waitFor(() => {
      expect(
        screen.getByText(/unable to load products.*try again/i)
      ).toBeInTheDocument()
    })
  })

  it("filters list when user types in search", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockProducts), { status: 200 })
    )
    const user = userEvent.setup()
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument()
    })
    const search = screen.getByPlaceholderText(/search products/i)
    await user.type(search, "B")
    await waitFor(() => {
      expect(screen.getByText("Product B")).toBeInTheDocument()
    })
    expect(screen.queryByText("Product A")).not.toBeInTheDocument()
  })

  it("renders Quantity Sold and Amount columns with values or em dash", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockProductsWithStats), { status: 200 })
    )
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument()
    })
    expect(screen.getByRole("columnheader", { name: /quantity sold/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /amount/i })).toBeInTheDocument()
    expect(screen.getByText("100.00")).toBeInTheDocument()
    expect(screen.getByText("$8,000.00")).toBeInTheDocument()
  })

  it("shows em dash for null stats when API returns products without stats", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockProducts), { status: 200 })
    )
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument()
    })
    const cells = screen.getAllByText("—")
    expect(cells.length).toBeGreaterThanOrEqual(3)
  })

  it("sorts by Quantity Sold when column header is clicked", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockProductsWithStats), { status: 200 })
    )
    const user = userEvent.setup()
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument()
    })
    const qtyHeader = screen.getByRole("columnheader", { name: /quantity sold/i })
    await user.click(qtyHeader)
    const rows = screen.getAllByRole("row").slice(1)
    const firstDataRow = rows[0]
    expect(firstDataRow).toHaveTextContent("Product B")
    expect(firstDataRow).toHaveTextContent("50")
    await user.click(qtyHeader)
    const rowsDesc = screen.getAllByRole("row").slice(1)
    expect(rowsDesc[0]).toHaveTextContent("Product A")
    expect(rowsDesc[0]).toHaveTextContent("100")
  })

  it("renders single Product column with name and SKU in same cell", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockProducts), { status: 200 })
    )
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument()
    })
    expect(screen.getByRole("columnheader", { name: /product/i })).toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: /^sku$/i })).not.toBeInTheDocument()
    expect(screen.getByText("SKU-A")).toBeInTheDocument()
    expect(screen.getByText("SKU-B")).toBeInTheDocument()
    const productARow = screen.getByText("Product A").closest("tr")
    expect(productARow).toHaveTextContent("Product A")
    expect(productARow).toHaveTextContent("SKU-A")
  })

  it("renders table with five columns (Product, Price, Quantity Sold, Amount, Status)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockProducts), { status: 200 })
    )
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument()
    })
    expect(screen.getByRole("columnheader", { name: /product/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /price/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /quantity sold/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /amount/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /status/i })).toBeInTheDocument()
  })

  it("renders Active and Inactive status badges when API returns mixed statuses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockProducts), { status: 200 })
    )
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument()
    })
    expect(screen.getByText("Active")).toBeInTheDocument()
    expect(screen.getByText("Inactive")).toBeInTheDocument()
  })

  it("shows No products found when API returns empty array", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    )
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/no products match your search/i)).not.toBeInTheDocument()
  })

  it("pagination shows Showing 1-20 of N and next page shows next range", async () => {
    const manyProducts = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      name: `Product ${i + 1}`,
      sku: `SKU-${i + 1}`,
      price: 10 + i,
      status: "active" as const,
    }))
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(manyProducts), { status: 200 })
    )
    const user = userEvent.setup()
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument()
    })
    expect(screen.getByText(/showing 1–20 of 25/i)).toBeInTheDocument()
    expect(screen.getByText("Product 20")).toBeInTheDocument()
    expect(screen.queryByText("Product 21")).not.toBeInTheDocument()
    const nextButton = screen.getByRole("button", { name: /next page/i })
    await user.click(nextButton)
    await waitFor(() => {
      expect(screen.getByText(/showing 21–25 of 25/i)).toBeInTheDocument()
    })
    expect(screen.getByText("Product 21")).toBeInTheDocument()
    expect(screen.getByText("Product 25")).toBeInTheDocument()
    expect(screen.queryByText("Product 1")).not.toBeInTheDocument()
  })
})
