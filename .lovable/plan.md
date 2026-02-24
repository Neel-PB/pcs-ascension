

## Remove Column Sort Dropdowns in Positions Tables + Fix Comment Badge Sizing

### Change 1: Remove sorting dropdown menus from column headers

The `DraggableColumnHeader` component currently renders a `DropdownMenu` with "Sort Ascending" and "Sort Descending" options on every column header (the small chevron-down icon). This will be removed entirely from the component so no table in the app shows it.

**Note:** Sorting still works via clicking the column header directly (the sort icon indicator remains). Only the dropdown menu trigger and its contents are removed.

**File: `src/components/editable-table/DraggableColumnHeader.tsx`**
- Remove the `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger` imports
- Remove the `ChevronDown` icon import
- Delete lines 122-140 (the entire DropdownMenu block)

### Change 2: Make comment badge a fixed size for consistency

The comment indicator badge currently sizes based on content (e.g., "-" vs "12" vs "99+"), making badges different widths across rows. This will add a fixed minimum width so all badges appear the same size.

**File: `src/components/editable-table/cells/CommentIndicatorCell.tsx`**
- Add `min-w-[2rem] justify-center text-center` classes to the Badge so all comment badges render at the same width regardless of content

### Files Changed

| File | Change |
|------|--------|
| `src/components/editable-table/DraggableColumnHeader.tsx` | Remove dropdown menu block and unused imports |
| `src/components/editable-table/cells/CommentIndicatorCell.tsx` | Add fixed min-width to comment badge for uniform sizing |

