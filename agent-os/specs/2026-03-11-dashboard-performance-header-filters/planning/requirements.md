# Spec Requirements: Dashboard & Performance Header Filters

## Initial Description

Let's get the performance page and dashboard page ready for filtering by adding filter buttons into the right side of the header component. Start with the design and front-end implementation before working on the schema set up. I'd like to be able to work on each page's ux before working on the real data.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the **primary filter** is **time range** (e.g. Week / Month / Quarter / Year) like in your screenshot, and that **Performance** should use the **same control set** as Dashboard. Is that correct, or should Performance expose **different** filters first (e.g. channel only, or time + channel in the header)?

**Answer:** Yes. The performance page should use the same control set.

**Q2:** I'm thinking filters should be **client-only for now** (local state or URL query params) so you can tune UX **without** API/schema changes. Should we **persist selection in the URL** (shareable/bookmarkable) or keep it **in-memory only** until backend exists?

**Answer:** Let's keep it in memory only.

**Q3:** Should the header be a **shared component** (e.g. `PageHeader` with `title`, `description`, optional `children`/`actions` on the right) used by **both** Dashboard and Performance only, or should **other pages** (Products, Dividends) adopt the same header pattern later?

**Answer:** The header should be a shared component which is adopted by other pages at a later time.

**Q4:** On **small screens**, should the filter buttons **wrap below** the title, **scroll horizontally**, or collapse into a **single dropdown**?

**Answer:** Let's collapse them into a dropdown.

**Q5:** For **accessibility**, I assume we use a **tablist / radiogroup** pattern (one selected period) with keyboard support. Any requirement for **screen reader** copy (e.g. "Time range: Month") beyond that?

**Answer:** No.

**Q6:** **Out of scope for this spec:** real aggregation by period, API query params, and DB schema — you said schema later. Should we **explicitly exclude** connecting filters to `/api/performance` and mock dashboard data in this phase, or is a **stub callback** (e.g. `onRangeChange` logging only) enough?

**Answer:** I don't know

**Q7:** **Anything we should explicitly not build** in v1 (e.g. custom date range picker, compare-to-previous-period toggle)?

**Answer:** Don't build anything not specified.

### Existing Code to Reference

User did not provide file/folder paths or names for similar features.

**Similar Features Identified:**

No similar existing features identified for reference (no paths provided).

### Follow-up Questions

No follow-up round was required. Q6 left open; scope boundaries below defer backend wiring until explicitly specified.

## Visual Assets

### Files Provided:

- `existing-ui-screenshot.png`: MantraDose Investor Dashboard — dark theme, left sidebar with Dashboard selected. Main header shows "Dashboard" title and subtitle on the left; **right side shows four horizontal segment controls: Week, Month, Quarter, Year** (Month appears active). Below: four KPI cards (YTD Revenue, YTD Units Sold, Current Month Revenue, Current Month Units) and "Revenue Trend (Last 12 Months)" line chart (pink line). Establishes placement and visual weight for time-range controls on the header right.

### Visual Insights:

- **Design patterns:** Header row is title/subtitle left, filters right; segmented pill/button style for period selection on desktop-wide layout.
- **User flow implications:** Changing period should eventually drive chart/cards; for UX-only phase, in-memory state only.
- **UI components shown:** Sidebar nav, metric cards, Recharts-style line chart, header filter group.
- **Fidelity level:** High-fidelity screenshot of existing (or target) UI — use as layout/placement reference; user chose **dropdown on small screens**, so responsive behavior may diverge from the all-pills layout on narrow viewports.

## Requirements Summary

### Functional Requirements

- Add filter controls for time range (Week / Month / Quarter / Year) on the **right side** of the header on **Dashboard** and **Performance** pages; **default selection: Year**.
- **Performance** uses the **same control set** as Dashboard.
- Filter selection is **in-memory only** (no URL persistence in this phase).
- On **small screens**, collapse period options into a **dropdown** (single control).
- Shared **header component** usable by Dashboard and Performance now; designed so **other pages can adopt later** without blocking this work.
- **No** extra screen-reader copy beyond baseline accessible control behavior (per user).
- **Do not build** features not specified (no custom date range, no compare toggle, etc., unless added to spec later).

### Reusability Opportunities

- Shared `PageHeader` (or equivalent) with slot/actions on the right for filters.
- Existing pages: `app/dashboard/page.tsx`, `app/dashboard/performance/page.tsx` — replace inline header blocks with shared component when implementing.
- Performance page already has channel state elsewhere; time-range header is separate unless later spec merges them.

### Scope Boundaries

**In Scope:**

- Design and front-end implementation of header + filter UI on Dashboard and Performance.
- Shared header component intended for future adoption on other pages.
- Responsive behavior: dropdown on small screens for period selection.
- Client-only state; UX iteration before real data/schema.

**Out of Scope:**

- Schema setup and backend aggregation by selected period (explicitly later).
- Persisting filter in URL (user chose in-memory only).
- Connecting filters to `/api/performance` or live dashboard data — **deferred** until user decides (Q6 unanswered); implementer may use stub/local state only.
- Custom date range picker, compare-to-previous-period toggle, or any feature not listed above.

### Technical Considerations

- Stack: Next.js App Router, React 19, Tailwind 4, Radix/shadcn-style components — dropdown can use existing Select/Dropdown patterns.
- Dashboard page is currently static/mock content; Performance fetches `/api/performance` — header filters must not require API changes in this phase.
- Visual reference shows horizontal pills on desktop; requirement is dropdown when collapsed (mobile) — clarify at implementation whether desktop stays as pills or also uses dropdown (user said "collapse them into a dropdown" for small screens; desktop can follow screenshot pattern unless spec is updated).
