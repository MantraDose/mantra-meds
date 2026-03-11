# Specification: Dashboard & Performance Header Filters

## Goal

Introduce a shared page header with time-range filter controls on the right for Dashboard and Performance so UX can be refined with in-memory state before schema and real data wiring.

## User Stories

- As an investor, I want to choose a time range (week/month/quarter/year) from the page header so that when data is wired, the view reflects my selected period.
- As a developer, I want one reusable header component on Dashboard and Performance so other pages can adopt the same pattern later without rework.

## Specific Requirements

**Shared page header component**

- Accepts title and optional description (and optional extra line below description, e.g. Performance date range).
- Provides a right-aligned slot for actions/filters so title block stays left and filters stay right on wide layouts.
- Uses flex layout with wrap-friendly structure so mobile can stack or isolate the filter control.
- Lives under `components/layout` or `components/ui` per project conventions; exported for use by Dashboard and Performance only in this spec.
- API stable enough for future pages (Products, etc.) to pass title/description and optional actions without breaking changes.

**Time range filter options**

- Options: Week, Month, Quarter, Year (single selection).
- Default selection is **Year**; no URL sync.
- State held in React state only; no persistence across refresh unless a later spec adds it.

**Desktop vs small-screen presentation**

- On wide viewports, present period choice as a compact segmented control (pill/group) aligned to the header right, consistent with existing-ui-screenshot.
- On small screens, collapse the four options into one dropdown (Select or equivalent) so the header does not overflow horizontally.
- Breakpoint choice follows existing responsive patterns (e.g. `md` or `lg`) and matches dashboard layout padding.

**Dashboard page integration**

- Replace the current inline title/subtitle block with the shared header plus time-range control.
- Page may remain static/mock; filter change does not need to alter chart or cards until backend exists.
- Optional: expose selected range via callback or context only if needed for local UX prototyping—no API contract in this spec.

**Performance page integration**

- Replace the current inline header block with the same shared header and identical time-range control set as Dashboard.
- Preserve existing date-range subtitle line from API when present; header component should allow optional secondary text without duplicating filter UI.
- Do not change `/api/performance` request shape or add query params in this spec; channel filters elsewhere stay as-is unless explicitly merged later.

**Accessibility**

- Segmented control must be keyboard operable and expose a single selected value (Radix Toggle Group or Select both satisfy baseline).
- No custom screen-reader-only copy required beyond what the chosen primitive provides.

**Channel filter separation**

- Performance page channel state (all/wholesale/retail) remains separate from time-range header; do not merge into one control unless a follow-up spec says so.

## Visual Design

`**planning/visuals/existing-ui-screenshot.png`**

- Dark theme; header row spans full content width with title left, filters right.
- Four horizontal controls: Week, Month, Quarter, Year; active state visually distinct (darker fill).
- Match corner radius and spacing to existing dashboard cards and sidebar accent (mantra-magenta) where appropriate for active state.
- KPI cards and chart below are out of scope for filter wiring but confirm vertical spacing after header (gap-8 pattern).
- Use as desktop reference; small-screen behavior overrides with dropdown per requirements.

## Existing Code to Leverage

`**app/dashboard/page.tsx**`

- Current header is a plain `div` with `h1` and `p`; replace with shared header component and pass title/subtitle.

`**app/dashboard/performance/page.tsx**`

- Same header pattern plus conditional date-range line; shared component should accept optional footer slot or children below subtitle for that line.
- Page is client component with existing `useState`; time-range state can live alongside channel state.

`**components/ui/toggle-group.tsx**`

- Radix-based segmented control; suitable for Week/Month/Quarter/Year on desktop with single selection (`type="single"`).

`**components/ui/select.tsx**`

- Radix Select; suitable for collapsing four options into one trigger on narrow viewports.

`**components/ui/button.tsx**`

- Already used on Performance for retry; any header actions should use existing variants for consistency.

## Out of Scope

- Database schema and migrations for time-bucketed aggregates.
- API changes to `/api/performance` or dashboard data sources driven by selected period.
- URL query params or shareable links for selected range.
- Custom date range picker or arbitrary from/to dates.
- Compare-to-previous-period toggle or dual-range UI.
- Wiring filter state to RevenueChart, MetricCard, or TopProductsTable data.
- Adopting the shared header on Products, Dividends, or other pages (future work).
- Persisting selection in localStorage or cookies.
- Internationalization of period labels beyond current app locale defaults.

