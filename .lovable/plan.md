

## Apply Consistent Column Changes Across All Position Tabs + Simplify Header Dropdown

### Part 1: Contractor Columns (`src/config/contractorColumns.tsx`)

Apply the same pattern as the Employees tab:

1. **Reorder**: Move `positionNum` to index 0, set `locked: true`
2. **Unlock**: Remove `locked: true` from `employeeName` (Contractor Name)
3. **Reduce widths**:
   - `FTE` (Hired FTE): 180/170 to 120/100
   - `actual_fte` (Active FTE): 180/170 to 120/100
   - `comments`: 80/80 to 60/60

### Part 2: Requisition Columns (`src/config/requisitionColumns.tsx`)

1. `positionNum` is already first and locked -- no reorder needed
2. **Reduce widths**:
   - `comments`: 80/80 to 60/60

### Part 3: Bump Storage Versions

- `src/pages/positions/ContractorsTab.tsx`: `"contractors-columns-v2"` to `"contractors-columns-v3"`
- `src/pages/positions/RequisitionsTab.tsx`: `"requisitions-columns"` to `"requisitions-columns-v2"`

### Part 4: Simplify Header Dropdown (`src/components/editable-table/DraggableColumnHeader.tsx`)

Remove from the dropdown menu:
- "Auto-fit Width" menu item (line 146-149)
- "Reset Width" menu item (line 150-153)
- "Hide Column" menu item with its separator (line 154-162)
- The separator before Auto-fit (line 145)

This leaves only **Sort Ascending** and **Sort Descending** in the dropdown.

Also remove unused props/imports (`onAutoFit`, `onResetWidth`, `onHide`, `Maximize2`, `RotateCcw`, `EyeOff`) and corresponding props from `TableHeader.tsx`.

