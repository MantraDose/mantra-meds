import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  accent?: boolean
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = false,
}: MetricCardProps) {
  return (
    <Card className={cn("border-border bg-card", accent && "border-mantra-magenta/30")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("mt-2 text-3xl font-bold tracking-tight text-card-foreground", accent && "text-mantra-magenta")}>
              {value}
            </p>
            {trend && (
              <p className="mt-1 flex items-center gap-1 text-sm">
                <span
                  className={cn(
                    "font-medium",
                    trend.positive ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {trend.positive ? "+" : ""}
                  {trend.value}
                </span>
                {subtitle && (
                  <span className="text-muted-foreground">{subtitle}</span>
                )}
              </p>
            )}
            {!trend && subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            accent ? "bg-mantra-magenta/15" : "bg-muted"
          )}>
            <Icon className={cn("h-5 w-5", accent ? "text-mantra-magenta" : "text-muted-foreground")} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
