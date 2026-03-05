

## Fix: Editable cells (Active FTE, Shift) open detail sheet instead of allowing editing

### Problem
Moving `onClick` to the row level means clicks on interactive/editable cells (ShiftCell popover, EditableFTECell popover) bubble up to the row `div`, opening the detail sheet instead of the cell's own editor.

### Solution
**File: `src/components/editable-table/TableRow.tsx`**

Add `e.stopPropagation()` on the cell wrapper `div` for columns that have `editable: true` or use a `renderCell` (custom type). This way:
- Non-editable built-in cells (text, number, badge, date) let the click bubble up → opens detail sheet
- Custom-rendered cells (Active FTE, Shift, Comments) stop propagation → their own click handlers work

Specifically, in the `columns.map(...)` block, change the cell wrapper:

```tsx
<div
  key={column.id}
  className="flex items-center overflow-hidden"
  onClick={column.renderCell ? (e) => e.stopPropagation() : undefined}
>
  {renderCell(column)}
</div>
```

This is a one-line change. Custom cells that need row-click behavior (like the comment indicator) can still call `onClick` explicitly via their own handlers if needed — but currently comment cells have their own `onClick` already wired.

