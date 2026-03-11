import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react"
import { MetricCard } from "@/components/charts/metric-card"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { TopProductsTable } from "@/components/tables/top-products-table"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          High-level performance snapshot for MantraDose
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="YTD Revenue"
          value="$760,800"
          icon={DollarSign}
          trend={{ value: "12.4%", positive: true }}
          subtitle="vs last year"
          accent
        />
        <MetricCard
          title="YTD Units Sold"
          value="32,820"
          icon={Package}
          trend={{ value: "8.7%", positive: true }}
          subtitle="vs last year"
        />
        <MetricCard
          title="Current Month Revenue"
          value="$79,800"
          icon={TrendingUp}
          trend={{ value: "4.6%", positive: true }}
          subtitle="vs last month"
        />
        <MetricCard
          title="Current Month Units"
          value="3,440"
          icon={ShoppingCart}
          trend={{ value: "4.6%", positive: true }}
          subtitle="vs last month"
        />
      </div>

      <div className="w-full">
        <RevenueChart />
      </div>

      <TopProductsTable />
    </div>
  )
}
