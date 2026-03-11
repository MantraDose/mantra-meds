# Task Breakdown: Skeleton Component Visual Tone

## Overview

Total Tasks: 1 group (4 sub-tasks)

Single-point visual change: soften the skeleton loading component so it is less loud on the dark theme. No database or API work; frontend-only.

## Task List

### Frontend — Skeleton Visual Tone

#### Task Group 1: Skeleton component and theme
**Dependencies:** None

- [x] 1.0 Complete skeleton visual tone update
  - [x] 1.1 Decide and apply background approach
  - [x] 1.2 Update `components/ui/skeleton.tsx`
  - [x] 1.3 Verify all consumers pick up the new look
  - [x] 1.4 Confirm global accent unchanged

**Acceptance Criteria:**

- Skeleton background is visually softer (lower opacity/brightness or muted token) on the dark theme.
- Change is applied in one place (`components/ui/skeleton.tsx` and optionally one variable in `app/globals.css`).
- Performance, Products, and sidebar skeletons all show the new tone with no layout or behavior changes.
- `animate-pulse` and `rounded-md` are preserved; global accent color is unchanged for non-skeleton UI.

## Execution Order

1. Frontend — Skeleton component and theme (Task Group 1)

## Visual References

- `planning/visuals/performance-skeleton-current.png` — current (loud) state; target is same layout, softer background.
- `planning/visuals/products-skeleton-current.png` — current (loud) state; target is same layout, softer background.
