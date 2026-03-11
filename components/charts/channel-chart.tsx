"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type ChannelChartDataPoint = {
  month: string
  wholesale?: number
  retail?: number
  revenue?: number
}

function CustomTooltip({
  active,
  payload,
  label,
  hasRevenueOnly,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
  hasRevenueOnly?: boolean
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {hasRevenueOnly
            ? `Revenue: $${entry.value.toLocaleString()}`
            : entry.dataKey === "wholesale"
              ? `Wholesale: $${entry.value.toLocaleString()}`
              : `Retail: $${entry.value.toLocaleString()}`}
        </p>
      ))}
    </div>
  )
}

export function ChannelChart({
  channel,
  data,
}: {
  channel: "all" | "wholesale" | "retail"
  data: ChannelChartDataPoint[]
}) {
  const hasWholesaleRetail =
    data.length > 0 &&
    data.some((d) => (d.wholesale ?? 0) > 0 || (d.retail ?? 0) > 0)
  const hasRevenueOnly =
    !hasWholesaleRetail &&
    data.some((d) => (d.revenue ?? 0) > 0)

  const chartData = data.length > 0 ? data : []

  const totalWholesale = chartData.reduce((s, d) => s + (d.wholesale ?? 0), 0)
  const totalRetail = chartData.reduce((s, d) => s + (d.retail ?? 0), 0)
  const totalRevenue = chartData.reduce((s, d) => s + (d.revenue ?? 0), 0)
  const total = hasWholesaleRetail ? totalWholesale + totalRetail : totalRevenue
  const wholesalePct =
    total > 0 ? ((totalWholesale / total) * 100).toFixed(1) : "0"
  const retailPct =
    total > 0 ? ((totalRetail / total) * 100).toFixed(1) : "0"

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Channel Breakdown
        </CardTitle>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {hasWholesaleRetail ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-mantra-magenta" />
                Wholesale {wholesalePct}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-mantra-purple" />
                Retail {retailPct}%
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-mantra-magenta" />
              Revenue
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <Tooltip
                content={
                  <CustomTooltip hasRevenueOnly={hasRevenueOnly} />
                }
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Legend
                iconType="square"
                iconSize={10}
                wrapperStyle={{ paddingTop: 16, fontSize: 12, color: "#a1a1aa" }}
              />
              {hasWholesaleRetail && (
                <>
                  {(channel === "all" || channel === "wholesale") && (
                    <Bar
                      dataKey="wholesale"
                      name="Wholesale"
                      fill="#dd0a8b"
                      radius={[4, 4, 0, 0]}
                      stackId="stack"
                    />
                  )}
                  {(channel === "all" || channel === "retail") && (
                    <Bar
                      dataKey="retail"
                      name="Retail"
                      fill="#3E32BF"
                      radius={[4, 4, 0, 0]}
                      stackId="stack"
                    />
                  )}
                </>
              )}
              {hasRevenueOnly && (
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#dd0a8b"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
