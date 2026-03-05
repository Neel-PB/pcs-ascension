

## Fix: Shift cell click opens details instead of edit popover in Open Requisitions

### Problem
In `OpenRequisitionTab.tsx`, the shift column is overridden with a custom `ShiftCell` renderer (line 62), but `editable: true` is not set on the column. The `TableRow` component only calls `stopPropagation` on cells marked `editable: true`, so clicking the shift cell triggers the row-level `onRowClick` handler (opening the details sheet) instead of the `ShiftCell` popover.

### Fix
**File: `src/pages/positions/OpenRequisitionTab.tsx`** — Add `editable: true` to the overridden shift column (around line 63):

```ts
return {
  ...col,
  editable: true,  // ← add this line
  renderCell: (row: Position) => (
    <ShiftCell ... />
  ),
};
```

Single-line addition. This matches the pattern used in `EmployeesTab.tsx` for editable columns.

