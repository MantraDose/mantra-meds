# Spec Requirements: Skeleton Component Visual Tone

## Initial Description

Reduce the visual prominence (loudness) of the skeleton loading component. Skeletons currently use the accent color (`#dd0a8b` / magenta) at full opacity, which appears too bright and saturated on the dark theme and draws excessive attention during loading states.

## Requirements Summary

### Problem

- Skeleton component uses `bg-accent` (accent = `#dd0a8b`).
- On dark backgrounds (Performance page, Products page, sidebar), the result is solid bright magenta/fuchsia rectangles that feel "loud" and distracting.
- Goal: make skeletons visually softer—e.g. by reducing opacity, lowering brightness, or using a more muted color—so loading states are noticeable but not jarring.

### Functional Requirements

- Change the skeleton component's appearance so it is less loud (lower opacity and/or lower brightness or a muted variant).
- Apply the change in one place so all consumers (Performance page, Products page, sidebar `SidebarMenuSkeleton`) benefit without per-page changes.
- Preserve existing behavior: skeleton remains a loading placeholder with pulse animation and rounded corners; only the visual tone changes.

### Scope Boundaries

**In scope:** Updating the single `Skeleton` UI component (or the theme variable it uses) so its background is subtler; ensuring all current usages automatically get the new look.

**Out of scope:** Changing the accent color globally for other UI (buttons, links, etc.); adding new skeleton variants or props unless necessary for the single muted look; changing layout or animation of skeletons.

### Visual Reference

- **Performance page:** Three horizontal skeleton blocks below the "Performance" title (dark theme). Currently bright magenta; target is a softer, less saturated appearance.
- **Products page:** Five stacked skeleton rows inside the products card (search bar visible). Currently bright magenta bars; target is the same softer tone.
- **Sidebar:** Skeleton used in `SidebarMenuSkeleton` for menu loading; should also appear softer.

## Technical Considerations

- Skeleton is implemented in `components/ui/skeleton.tsx` with `className={cn('bg-accent animate-pulse rounded-md', className)}`. Options include: (1) switching to a muted background (e.g. `bg-muted` or a new token), (2) using accent with opacity (e.g. `bg-accent/20` or similar), or (3) introducing a dedicated `--skeleton` (or similar) CSS variable in `app/globals.css` and using that for skeletons only so accent stays unchanged elsewhere.
- Theme variables live in `app/globals.css` (`:root` and `@theme inline`). Any new variable should follow existing naming and be wired for Tailwind if used via class.
