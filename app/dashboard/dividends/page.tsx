"use client"

import { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { capTable, dividendHistory } from "@/lib/mock-data"

const PIE_COLORS = ["#dd0a8b", "#3E32BF", "#22d3ee", "#facc15", "#f97316", "#a78bfa"]

function CapPieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-md">
      <p style={{ color: payload[0].payload.fill }}>
        {payload[0].name}: {payload[0].value.toFixed(2)}%
      </p>
    </div>
  )
}

function DivTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((e) => (
        <p key={e.dataKey} style={{ color: e.color }}>
          {e.dataKey === "wholesaleDiv" ? "Wholesale (5%)" : "Retail (10%)"}: $
          {e.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function DividendsPage() {
  const [open, setOpen] = useState(false)
  const [formWholesale, setFormWholesale] = useState("")
  const [formRetail, setFormRetail] = useState("")

  const wholesaleDiv = formWholesale ? parseFloat(formWholesale) * 0.05 : 0
  const retailDiv = formRetail ? parseFloat(formRetail) * 0.1 : 0
  const totalDiv = wholesaleDiv + retailDiv

  const totalShares = capTable.reduce((s, m) => s + m.shares, 0)

  const ytdDividends = useMemo(() => {
    return dividendHistory
      .filter((d) => d.month.includes("2026"))
      .reduce((s, d) => s + d.totalDividend, 0)
  }, [])

  const allTimeDividends = dividendHistory.reduce((s, d) => s + d.totalDividend, 0)

  const divChartData = dividendHistory.map((d) => ({
    month: d.month.replace(/\s\d{4}/, "").substring(0, 3),
    wholesaleDiv: Math.round(d.wholesaleRev * 0.05),
    retailDiv: Math.round(d.retailRev * 0.1),
  }))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dividends</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cap table and dividend history tracking
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-mantra-magenta text-primary-foreground hover:bg-mantra-magenta/90">
              <Plus className="h-4 w-4" />
              Add Dividend Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Dividend Entry</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Wholesale Revenue</Label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={formWholesale}
                  onChange={(e) => setFormWholesale(e.target.value)}
                  className="bg-muted/50 text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  5% dividend = ${wholesaleDiv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Retail Revenue</Label>
                <Input
                  type="number"
                  placeholder="e.g. 30000"
                  value={formRetail}
                  onChange={(e) => setFormRetail(e.target.value)}
                  className="bg-muted/50 text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  10% dividend = ${retailDiv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-lg border border-mantra-magenta/30 bg-mantra-magenta/5 p-4">
                <p className="text-sm font-medium text-foreground">Total Dividend</p>
                <p className="mt-1 text-2xl font-bold text-mantra-magenta">
                  ${totalDiv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <Button
                className="w-full bg-mantra-magenta text-primary-foreground hover:bg-mantra-magenta/90"
                onClick={() => setOpen(false)}
              >
                Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* YTD Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-mantra-magenta/30 bg-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">YTD Dividends (2026)</p>
            <p className="mt-2 text-3xl font-bold text-mantra-magenta">
              ${ytdDividends.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">All-Time Dividends</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              ${allTimeDividends.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Shares Outstanding</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {totalShares.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cap Table + Pie */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border bg-card xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-card-foreground">Cap Table</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Member</TableHead>
                  <TableHead className="text-right text-muted-foreground">Shares</TableHead>
                  <TableHead className="text-right text-muted-foreground">Ownership %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capTable.map((m, i) => (
                  <TableRow key={m.member} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                      {m.member}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {m.shares.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {m.ownership.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-border bg-muted/30 font-semibold">
                  <TableCell className="text-foreground">Total</TableCell>
                  <TableCell className="text-right text-foreground">
                    {totalShares.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-foreground">100.00%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-card-foreground">Ownership</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-[240px] w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={capTable.map((m) => ({ name: m.member, value: m.ownership }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {capTable.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CapPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dividend Trend */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-card-foreground">
            Dividend Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divChartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} dx={-10} />
                <Tooltip content={<DivTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="wholesaleDiv" name="Wholesale (5%)" fill="#dd0a8b" radius={[4, 4, 0, 0]} stackId="div" />
                <Bar dataKey="retailDiv" name="Retail (10%)" fill="#3E32BF" radius={[4, 4, 0, 0]} stackId="div" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dividend History */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-card-foreground">
            Dividend History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Month</TableHead>
                  <TableHead className="text-right text-muted-foreground">Wholesale Rev</TableHead>
                  <TableHead className="text-right text-muted-foreground">Retail Rev</TableHead>
                  <TableHead className="text-right text-muted-foreground">Total Dividend</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dividendHistory.map((d) => (
                  <TableRow key={d.month} className="border-border">
                    <TableCell className="font-medium text-foreground">{d.month}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ${d.wholesaleRev.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ${d.retailRev.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ${d.totalDividend.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          d.status === "Paid"
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/20"
                        }
                      >
                        {d.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
