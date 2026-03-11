# Task Breakdown: Dashboard & Performance Header Filters

## Overview

Total task groups: **3** (frontend-only; no database or API work per spec).

This spec is **design and front-end first**: shared header + time-range UI on Dashboard and Performance, in-memory state only, default **Year**. Schema and `/api/performance` wiring are out of scope.

## Task List

### Frontend — Layout & Components

#### Task Group 1: Shared PageHeader and Time Range Control

**Dependencies:** None

- [x] 1.0 Complete shared header and time-range UI
  - [x] 1.1 Write 2–6 focused tests for `PageHeader` / time-range behavior
    - Default selection is **Year**
    - Selecting another option updates value (controlled or internal state)
    - Optional: snapshot or role check for segmented vs dropdown visibility at breakpoint (if testable without brittle CSS)
    - Skip exhaustive state-matrix coverage
  - [x] 1.2 Add shared `PageHeader` (or equivalent) in `components/layout` or `components/ui`
    - Props: `title`, optional `description`, optional slot for content below description (e.g. Performance date-range line), optional `actions` / right slot for filters
    - Flex layout: title block left, actions right on wide screens; wrap-friendly for narrow
    - Match spacing with existing pages (`gap-8` below header unchanged)
  - [x] 1.3 Implement time-range type and options
    - Values: `week` | `month` | `quarter` | `year` (or string union aligned with codebase)
    - Default: **Year**
    - Single selection only; no URL sync
  - [x] 1.4 Desktop: segmented control using `components/ui/toggle-group.tsx`
    - Four items: Week, Month, Quarter, Year
    - Active state visually distinct; align with `planning/visuals/existing-ui-screenshot.png` (dark fill / mantra-magenta accent as appropriate)
  - [x] 1.5 Small screens: single `Select` using `components/ui/select.tsx`
    - Same four options; collapse into one trigger so header does not overflow
    - Breakpoint consistent with dashboard layout (e.g. `md`/`lg`)
  - [x] 1.6 Wire responsive switch (toggle-group visible ≥ breakpoint, Select below)
  - [x] 1.7 Ensure component tests from 1.1 pass
    - Run **only** tests added in 1.1
    - Do **not** run full suite at this stage

**Acceptance Criteria:**

- Header shows title/description left and time-range control right on desktop
- Default selected period is **Year**
- Narrow viewport shows dropdown only; wide shows segmented control
- Keyboard operable (Radix primitives)
- Tests from 1.1 pass

---

### Frontend — Page Integration

#### Task Group 2: Dashboard Page

**Dependencies:** Task Group 1

- [x] 2.0 Integrate header on Dashboard
  - [x] 2.1 Replace inline header in `app/dashboard/page.tsx`
    - Use shared `PageHeader` with title "Dashboard" and existing subtitle
    - Render time-range control in header actions; state in memory only (client wrapper if page stays server component)
  - [x] 2.2 Keep existing content unchanged below header
    - Metric cards, `RevenueChart`, `TopProductsTable` — no data wiring to filter in this spec
  - [x] 2.3 Visual check against `planning/visuals/existing-ui-screenshot.png`
    - Placement and weight of filter group on the right

**Acceptance Criteria:**

- Dashboard uses shared header + time-range control
- No API or schema changes
- Layout and spacing match dashboard layout conventions

---

#### Task Group 3: Performance Page

**Dependencies:** Task Group 1

- [x] 3.0 Integrate header on Performance
  - [x] 3.1 Replace inline header block in `app/dashboard/performance/page.tsx`
    - Same time-range control set as Dashboard (reuse shared component)
    - Preserve optional third line: API `dateRange` formatted string when loaded — pass via PageHeader children/slot below description
  - [x] 3.2 Do not alter `fetch("/api/performance")` or add query params
    - Channel filter (`all` / `wholesale` / `retail`) remains separate; do not merge into header
  - [x] 3.3 Visual/regression check: loading, error, and success states still readable with new header

**Acceptance Criteria:**

- Performance header matches Dashboard filter UX
- Date-range subtitle from API still appears when data is present
- No changes to performance API contract

---

### Testing (Optional Consolidation)

#### Task Group 4: Test Review & Gap Analysis (if needed)

**Dependencies:** Task Groups 1–3

- [x] 4.0 Review and add only critical gaps
  - [x] 4.1 Review tests from Task Group 1
  - [x] 4.2 If a critical workflow lacks coverage (e.g. Performance header with date line + filter), add up to **5** tests max — *no critical gaps; Performance page tests still assert date range + channel UI; layout tests cover TimeRangeFilter/PageHeader*
  - [x] 4.3 Run feature-related tests only (not full suite) — *full suite run at wrap-up; all passing*

**Acceptance Criteria:**

- Feature-specific tests pass
- No more than ~5 additional tests unless a critical gap is found

---

## Execution Order

1. **Task Group 1** — PageHeader + time-range (Year default, desktop segmented / mobile Select)
2. **Task Groups 2 and 3** — Dashboard and Performance integration (can be done in parallel after 1)
3. **Task Group 4** — Only if gaps remain after 1–3

## Out of Scope (do not task)

- Database migrations or models
- API route changes or query params for period
- URL persistence, localStorage, custom date range, compare toggle
- Wiring filter to chart/cards/table data
- Adopting header on Products, Dividends, etc.

## Visual Reference

- `agent-os/specs/2026-03-11-dashboard-performance-header-filters/planning/visuals/existing-ui-screenshot.png` — desktop header + four pills; mobile uses dropdown per requirements.
