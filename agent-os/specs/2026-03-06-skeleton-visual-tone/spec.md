# Specification: Skeleton Component Visual Tone

## Goal

Reduce the visual prominence of the skeleton loading component so it is noticeable but not jarring on the dark theme, by lowering opacity or brightness (or using a muted color) in a single place so all usages are updated.

## User Stories

- As a user, I want skeleton placeholders during loading to be visually subdued so that they indicate loading without drawing excessive attention or feeling loud.
- As a developer, I want the skeleton appearance to be controlled in one component or theme variable so that all pages (Performance, Products, sidebar) stay consistent without per-page overrides.

## Specific Requirements

**Single-point visual change**

- Update the skeleton’s background so it is less loud: either lower opacity (e.g. accent with opacity), lower brightness, or a muted/neutral token.
- Apply the change only in `components/ui/skeleton.tsx` (or one theme variable it uses) so every consumer gets the new look automatically.
- Do not change the accent color globally; other UI (buttons, links, focus rings) must keep the current accent.

**Preserve behavior**

- Keep `animate-pulse` and `rounded-md` (and existing `data-slot` / props). Only the background color/opacity changes.
- All current usages (Performance page KPI skeletons, Products page table skeletons, sidebar `SidebarMenuSkeleton`) must continue to work with no API or layout changes.

**Theme and tokens**

- Prefer reusing an existing token (e.g. `muted`) or adding a dedicated skeleton variable (e.g. in `app/globals.css`) over hardcoding a one-off color in the component.
- If a new CSS variable is added, follow existing naming in `app/globals.css` and wire it in `@theme inline` if used via Tailwind.

**Consistency**

- The same subdued appearance must apply everywhere the `Skeleton` component is used; no page-specific skeleton styling for this spec.

## Visual Design

**`planning/visuals/performance-skeleton-current.png`**

- Dark-themed Performance page with three horizontal skeleton blocks below the title; currently bright magenta.
- Target: same layout and count, with a softer, less saturated background so the blocks feel like subtle placeholders.

**`planning/visuals/products-skeleton-current.png`**

- Products page with search bar and five stacked skeleton rows in a card; currently bright magenta bars.
- Target: same layout and count, with the same softer skeleton tone as on Performance.

## Existing Code to Leverage

**`components/ui/skeleton.tsx`**

- Single export `Skeleton` with `bg-accent animate-pulse rounded-md`. Change the background class (or the token it uses) to achieve the softer look; keep the rest of the component unchanged.

**`app/globals.css`**

- Defines `--accent`, `--muted`, and other theme variables. Add a skeleton-specific variable here if desired, and map it in `@theme inline` so Tailwind can use it (e.g. `bg-skeleton`).

**`app/dashboard/performance/page.tsx`**

- Uses three `<Skeleton className="h-[120px] w-full rounded-lg" />` in loading state. No code changes required; they will pick up the new appearance.

**`app/dashboard/products/page.tsx`**

- Uses five `<Skeleton key={i} className="h-12 w-full rounded-md" />` in loading state. No code changes required.

**`components/ui/sidebar.tsx`**

- `SidebarMenuSkeleton` uses `<Skeleton>` for icon and text placeholders. No changes required; they will inherit the new look.

## Out of Scope

- Changing the global accent color or other brand colors for non-skeleton UI.
- Adding multiple skeleton variants (e.g. “strong” vs “subtle”) or new props for this spec.
- Changing skeleton layout, size, or animation (e.g. pulse timing).
- Per-page or per-route overrides for skeleton appearance.
- Backend or API changes.
- New pages or features that use skeletons.
- Adjusting contrast or accessibility of non-skeleton components.
- Removing or replacing skeleton with a different loading pattern (e.g. spinners only).
