

## Fix: Clicking any non-editable column should open the detail sheet

### Problem
Currently, only cells rendered with built-in types (`text`, `number`, `badge`, `date`) receive the `onClick` handler. Custom-rendered cells (like `TruncatedTextCell`, `BadgeCell` via `renderCell`) don't get the row click handler, so clicking them does nothing.

### Solution
Move the `onClick` handler from individual cells up to the row-level `div` in `TableRow.tsx`. Editable cells (like `ShiftCell`) already call `e.stopPropagation()`, so they won't trigger the row click.

**File: `src/components/editable-table/TableRow.tsx`**

1. Add `onClick={onClick}` to the outer row `div` (line ~50)
2. Remove `onClick={onClick}` from individual cell renderers (`TextCell`, `NumberCell`, `BadgeCell`, `DateCell` — lines 36-46)

This is a single-file change. All five position tabs (Employee, Contractor, Open Requisition, Open Position, Contractor Requisition) will benefit since they all use `EditableTable` with `onRowClick`.

