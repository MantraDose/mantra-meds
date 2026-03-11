import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PerformancePage from "@/app/dashboard/performance/page"

const mockSummary = {
  totalRevenue: 430192.75,
  totalOrders: 1888,
  averageOrderValue: 227.86,
  revenueByMonth: [
    { month: "Nov 25", revenue: 695.5 },
    { month: "Dec 25", revenue: 96973 },
    { month: "Jan 26", revenue: 193487.75 },
    { month: "Feb 26", revenue: 139636.5 },
  ],
  dateRange: { start: "2024-03-02", end: "2025-03-02" },
}

describe("Performance page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("calls /api/performance on mount", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockSummary), { status: 200 })
    )
    render(<PerformancePage />)
    expect(global.fetch).toHaveBeenCalledWith("/api/performance")
    await waitFor(() => {
      expect(screen.getByText("Performance")).toBeInTheDocument()
    })
  })

  it("does not render Orders table or Export CSV", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockSummary), { status: 200 })
    )
    render(<PerformancePage />)
    await waitFor(() => {
      expect(screen.getByText(/430,192\.75/)).toBeInTheDocument()
    })
    expect(screen.queryByRole("button", { name: /export csv/i })).not.toBeInTheDocument()
    expect(screen.queryByText("Order ID")).not.toBeInTheDocument()
  })

  it("shows KPI cards with values after successful fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockSummary), { status: 200 })
    )
    render(<PerformancePage />)
    await waitFor(() => {
      expect(screen.getByText("Total Revenue")).toBeInTheDocument()
    })
    expect(screen.getByText(/430,192\.75/)).toBeInTheDocument()
    expect(screen.getByText("Total Orders")).toBeInTheDocument()
    expect(screen.getByText("1,888")).toBeInTheDocument()
    expect(screen.getByText("Avg Order Value")).toBeInTheDocument()
    expect(screen.getByText(/227\.86/)).toBeInTheDocument()
  })

  it("shows Channel Breakdown section and channel filter buttons", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockSummary), { status: 200 })
    )
    render(<PerformancePage />)
    await waitFor(() => {
      expect(screen.getByText("Channel Breakdown")).toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /wholesale/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /retail/i })).toBeInTheDocument()
  })

  it("shows date range when present in API response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockSummary), { status: 200 })
    )
    render(<PerformancePage />)
    await waitFor(() => {
      expect(screen.getByText(/430,192\.75/)).toBeInTheDocument()
    })
    expect(screen.getByText(/Mar \d+, \d+ – Mar \d+, \d+|Last 12 months/)).toBeInTheDocument()
  })

  it("shows error message and Retry when API returns non-2xx", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Server error" }), { status: 502 })
    )
    render(<PerformancePage />)
    await waitFor(() => {
      expect(
        screen.getByText(/unable to load performance data|failed to load performance data/i)
      ).toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
  })

  it("retries fetch when Retry is clicked", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Server error" }), { status: 502 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockSummary), { status: 200 })
      )
    const user = userEvent.setup()
    render(<PerformancePage />)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole("button", { name: /retry/i }))
    await waitFor(() => {
      expect(screen.getByText(/430,192\.75/)).toBeInTheDocument()
    })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
