# Implementation: Skeleton Visual Tone (Task Group 1)

## Summary

- **Approach:** Reused existing token `bg-muted` for the skeleton background (no new CSS variable).
- **Change:** In `components/ui/skeleton.tsx`, replaced `bg-accent` with `bg-muted`. Left `animate-pulse`, `rounded-md`, `data-slot`, and all props unchanged.
- **Global accent:** Unchanged; `app/globals.css` was not modified. Buttons, links, and focus rings still use `--accent: #dd0a8b`.

## Files Modified

- `components/ui/skeleton.tsx` — one-line change: `bg-accent` → `bg-muted`.

## Verification

- Lint: no errors on `skeleton.tsx`.
- All consumers (Performance page, Products page, `SidebarMenuSkeleton`) use the same `<Skeleton>` component with no overrides, so they automatically use the new muted background.
- Visual verification: run the app, log in if required, and visit `/dashboard/performance` and `/dashboard/products` during loading to confirm skeletons appear softer (dark gray instead of bright magenta).
