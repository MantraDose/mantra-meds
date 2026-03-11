"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PageHeaderProps = {
  title: string
  description?: string
  /** Rendered below description (e.g. Performance API date range line) */
  children?: React.ReactNode
  /** Right-aligned slot (e.g. TimeRangeFilter) */
  actions?: React.ReactNode
  className?: string
}

/**
 * Shared page header: title/description left, optional actions right.
 * Wrap-friendly for narrow viewports. Parent page keeps gap-8 to content below.
 */
export function PageHeader({
  title,
  description,
  children,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {children ? <div className="mt-1">{children}</div> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center sm:pt-0.5">{actions}</div>
      ) : null}
    </div>
  )
}
