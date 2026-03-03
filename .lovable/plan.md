

## Add Sort Click Handler to Column Headers

### Problem
The `DraggableColumnHeader` component receives an `onSort` callback but never attaches a click handler to the header element. Users cannot click column headers to sort — the sort icon only appears if sorting is already active (from code), but there's no UI interaction to trigger it.

### Root Cause
In `src/components/editable-table/DraggableColumnHeader.tsx`, the outer `<div>` has no `onClick` handler. The `onSort` prop is passed in but unused except for displaying the icon.

### Fix

**File:** `src/components/editable-table/DraggableColumnHeader.tsx`

Add an `onClick` handler to the header `<div>` that:
1. Only fires when `onSort` is defined (i.e., column is sortable)
2. Toggles direction: if already sorted asc → desc, otherwise → asc
3. Adds `cursor-pointer` class when sortable

Additionally, always show a subtle sort indicator (e.g., dimmed `ArrowUp`) on hover for sortable columns that aren't currently sorted, so users know they can click.

**Changes:**
- Add `onClick` to the header div that calls `onSort(newDirection)`
- Update `getSortIcon` to show a muted arrow on hover for unsorted sortable columns
- Add `cursor-pointer` when `onSort` is defined

**File:** `src/config/contractorColumns.tsx` (line 82)
- Change `sortable: false` to `sortable: true` on the Status column (as previously discussed)

No other files need changes — the `onSort` prop is already wired from `EditableTable` → `TableHeader` → `DraggableColumnHeader` in all tabs.

