# Task Group 1: PageHeader and Time Range — Implementation

## Summary

- **`components/layout/time-range.ts`** — `TimeRange` union, `DEFAULT_TIME_RANGE` = `year`, labels map, type guard.
- **`components/layout/page-header.tsx`** — Client component: `title`, optional `description`, optional `children` (below description), optional `actions` (right). Flex row on `sm+`, stack on narrow.
- **`components/layout/time-range-filter.tsx`** — Client component: controlled/uncontrolled `value` / `onValueChange`. **Desktop (`md+`):** `ToggleGroup` outline, four items, active state `mantra-magenta` tint. **Below `md`:** `Select` with same four options. Default **Year**.

## Tests

- **`components/layout/time-range-filter.test.tsx`** — 5 tests: default Year (`data-state=on` on Year toggle), controlled `onValueChange`, uncontrolled internal state, PageHeader title/description, PageHeader actions slot.
- Run: `pnpm exec vitest run components/layout/time-range-filter.test.tsx`

## Notes

- Dashboard/Performance integration is Task Group 2–3; pages not updated in this group.
- No API or URL persistence.
