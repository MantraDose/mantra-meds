"use client"

import * as React from "react"
import {
  DEFAULT_TIME_RANGE,
  TIME_RANGE_LABELS,
  TIME_RANGE_VALUES,
  type TimeRange,
  isTimeRange,
} from "@/components/layout/time-range"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export type TimeRangeFilterProps = {
  /** Controlled value */
  value?: TimeRange
  /** Called when selection changes */
  onValueChange?: (value: TimeRange) => void
  className?: string
}

/**
 * Week / Month / Quarter / Year selector.
 * Desktop (md+): segmented toggle group. Small screens: single Select.
 * Default selection is Year when uncontrolled.
 */
export function TimeRangeFilter({
  value: controlledValue,
  onValueChange,
  className,
}: TimeRangeFilterProps) {
  const [internalValue, setInternalValue] =
    React.useState<TimeRange>(DEFAULT_TIME_RANGE)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue! : internalValue

  function setValue(next: TimeRange) {
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  function handleToggleChange(v: string) {
    if (v && isTimeRange(v)) setValue(v)
  }

  function handleSelectChange(v: string) {
    if (isTimeRange(v)) setValue(v)
  }

  return (
    <div className={cn("flex items-center", className)}>
      {/* Desktop: segmented control — hidden below md */}
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={handleToggleChange}
        variant="outline"
        size="sm"
        className={cn("hidden md:flex", "bg-muted/30")}
        aria-label="Time range"
      >
        {TIME_RANGE_VALUES.map((key) => (
          <ToggleGroupItem
            key={key}
            value={key}
            className={cn(
              "px-3 text-xs font-medium",
              "data-[state=on]:bg-mantra-magenta/15 data-[state=on]:text-mantra-magenta",
              "data-[state=on]:border-mantra-magenta/40"
            )}
          >
            {TIME_RANGE_LABELS[key]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Small screens: single Select — hidden md and up */}
      <div className="md:hidden">
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger
            size="sm"
            className="w-30 bg-muted/30"
            aria-label="Time range"
          >
            <SelectValue placeholder={TIME_RANGE_LABELS[DEFAULT_TIME_RANGE]} />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_VALUES.map((key) => (
              <SelectItem key={key} value={key}>
                {TIME_RANGE_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
