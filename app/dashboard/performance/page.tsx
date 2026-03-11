"use client"

import { useState, useEffect } from "react"
import { DollarSign, ShoppingCart, Receipt } from "lucide-react"
import { MetricCard } from "@/components/charts/metric-card"
import { ChannelChart } from "@/components/charts/channel-chart"
import type { ChannelChartDataPoint } from "@/components/charts/channel-chart"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { TimeRangeFilter } from "@/components/layout/time-range-filter"

interface PerformanceSummary {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  revenueByMonth: { month: string; revenue: number }[]
  dateRange?: { start: string; end: string }
}

function formatDateRange(dateRange: { start: string; end: string }): string {
  try {
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return "Last 12 months"
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "2-digit",
    }
    return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`
  } catch {
    return "Last 12 months"
  }
}

export default function PerformancePage() {
  const [channel, setChannel] = useState<"all" | "wholesale" | "retail">("all")
  const [data, setData] = useState<PerformanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/performance")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load performance data")
        return res.json()
      })
      .then((json: PerformanceSummary) => {
        if (!cancelled) setData(json)
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Unable to load performance data. Please try again."
          )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const chartData: ChannelChartDataPoint[] = data?.revenueByMonth?.length
    ? data.revenueByMonth.map((row) => ({ month: row.month, revenue: row.revenue }))
    : []

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Performance"
        description="Deep-dive into revenue, orders, and channel mix"
        actions={<TimeRangeFilter />}
      >
        {!loading && !error && data?.dateRange && (
          <p className="text-xs text-muted-foreground">
            {formatDateRange(data.dateRange)}
          </p>
        )}
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setError(null)
              setLoading(true)
              fetch("/api/performance")
                .then((res) => {
                  if (!res.ok) throw new Error("Failed to load performance data")
                  return res.json()
                })
                .then((json: PerformanceSummary) => setData(json))
                .catch((err) =>
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Unable to load performance data. Please try again."
                  )
                )
                .finally(() => setLoading(false))
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-[120px] w-full rounded-lg" />
          <Skeleton className="h-[120px] w-full rounded-lg" />
          <Skeleton className="h-[120px] w-full rounded-lg" />
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              title="Total Revenue"
              value={`$${data.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              accent
            />
            <MetricCard
              title="Total Orders"
              value={data.totalOrders.toLocaleString()}
              icon={Receipt}
            />
            <MetricCard
              title="Avg Order Value"
              value={
                data.totalOrders > 0
                  ? `$${data.averageOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "—"
              }
              icon={ShoppingCart}
            />
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Channel:
              </span>
              {(["all", "wholesale", "retail"] as const).map((c) => (
                <Button
                  key={c}
                  variant={channel === c ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChannel(c)}
                  className={
                    channel === c
                      ? "bg-mantra-magenta text-primary-foreground hover:bg-mantra-magenta/90"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Button>
              ))}
            </div>
            <ChannelChart channel={channel} data={chartData} />
          </div>
        </>
      )}

      {!loading && !error && !data && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No performance data available.
        </div>
      )}
    </div>
  )
}
