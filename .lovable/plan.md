

# Fix Checkbox Alignment in RBAC Detail View

## Problem
In the RBAC Detail View, checkboxes are not properly aligned with their labels in the permission rows.

## Root Cause
The `CompactPermissionRow` component's checkbox container uses `flex items-center gap-2`, but the Radix `Checkbox` primitive can have slight vertical alignment inconsistencies due to its internal flex layout. Adding explicit `shrink-0` at the usage site and ensuring consistent vertical centering will fix this.

## Change

### `src/components/admin/RoleDetailView.tsx`
In the `CompactPermissionRow` component (around line 160-167), wrap the `Checkbox` to ensure it doesn't get squeezed and aligns perfectly:

- Add `shrink-0` to the Checkbox className (currently only `h-4 w-4`)
- Add `leading-none` or adjust the text span to use `leading-tight` for consistent baseline alignment
- Ensure the outer flex container uses `items-start pt-0.5` or keeps `items-center` with the checkbox properly constrained

The fix is a small CSS tweak to the `CompactPermissionRow` layout — changing the checkbox class to `h-4 w-4 shrink-0 mt-px` and ensuring the label text has `leading-normal` for consistent vertical centering across all permission categories.

## Files Modified
- `src/components/admin/RoleDetailView.tsx` — fix checkbox alignment in `CompactPermissionRow`

