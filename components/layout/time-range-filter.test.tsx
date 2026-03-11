import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TimeRangeFilter } from "@/components/layout/time-range-filter"
import { PageHeader } from "@/components/layout/page-header"
import { DEFAULT_TIME_RANGE } from "@/components/layout/time-range"

describe("TimeRangeFilter", () => {
  it("defaults to Year when uncontrolled", () => {
    render(<TimeRangeFilter />)
    // Select is always in DOM but hidden on md+; toggle group hidden below md.
    // Year toggle should have pressed state on desktop — Radix renders aria-pressed
    const yearToggle = screen.getByRole("radio", { name: /year/i })
    expect(yearToggle).toHaveAttribute("data-state", "on")
  })

  it("calls onValueChange when selecting another period (controlled)", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TimeRangeFilter
        value={DEFAULT_TIME_RANGE}
        onValueChange={onValueChange}
      />
    )
    await user.click(screen.getByRole("radio", { name: /month/i }))
    expect(onValueChange).toHaveBeenCalledWith("month")
  })

  it("uses internal state when uncontrolled and updates on click", async () => {
    const user = userEvent.setup()
    render(<TimeRangeFilter />)
    await user.click(screen.getByRole("radio", { name: /quarter/i }))
    const quarterToggle = screen.getByRole("radio", { name: /quarter/i })
    expect(quarterToggle).toHaveAttribute("data-state", "on")
  })
})

describe("PageHeader", () => {
  it("renders title and description", () => {
    render(
      <PageHeader
        title="Dashboard"
        description="High-level performance snapshot"
      />
    )
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument()
    expect(screen.getByText("High-level performance snapshot")).toBeInTheDocument()
  })

  it("renders actions slot", () => {
    render(
      <PageHeader
        title="Performance"
        actions={<span data-testid="actions">Filter</span>}
      />
    )
    expect(screen.getByTestId("actions")).toHaveTextContent("Filter")
  })
})
