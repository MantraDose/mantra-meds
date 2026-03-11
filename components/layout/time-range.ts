/**
 * Time range period for dashboard/performance header filters.
 * In-memory only until backend wiring; default is year per spec.
 */
export const TIME_RANGE_VALUES = ["week", "month", "quarter", "year"] as const

export type TimeRange = (typeof TIME_RANGE_VALUES)[number]

export const DEFAULT_TIME_RANGE: TimeRange = "year"

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
}

export function isTimeRange(value: string): value is TimeRange {
  return TIME_RANGE_VALUES.includes(value as TimeRange)
}
