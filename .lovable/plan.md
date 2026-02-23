

## Consistent Two-Row Column Headers with Aligned Totals

### Approach
Make ALL column headers use a fixed two-row layout. Columns with totals (Employee Name, Hired FTE, Active FTE) show the value on the second row. All other columns show only the label on the first row with an empty second row, ensuring everything aligns perfectly.

### Changes

**File: `src/components/editable-table/DraggableColumnHeader.tsx`**

- Increase header height from `h-10` (40px) to `h-12` (48px) to accommodate two lines.
- Change the label wrapper from `truncate flex-1` to a flex-col layout so `renderHeader` content controls both rows naturally.

Specifically on line 73, change `h-10` to `h-12`.

**File: `src/config/employeeColumns.tsx`**

Update ALL `renderHeader` overrides inside `createEmployeeColumnsWithComments` to use a consistent two-row structure:

- **Every column** gets a `renderHeader` that uses `flex flex-col leading-tight` with two fixed rows
- Columns WITH totals (employeeName, FTE, actual_fte) show the total on the second row
- Columns WITHOUT totals (positionNum, jobTitle, shift, payrollStatus, employmentType, comments) show only the label with an invisible placeholder on the second row to maintain alignment

Example for a column WITH a total:
```tsx
renderHeader: () => (
  <span className="flex flex-col leading-tight">
    <span>Employee Name</span>
    <span className="text-[10px] text-muted-foreground font-normal">
      (7,234)
    </span>
  </span>
)
```

Example for a column WITHOUT a total:
```tsx
renderHeader: () => (
  <span className="flex flex-col leading-tight">
    <span>Position #</span>
    <span className="text-[10px] invisible">-</span>
  </span>
)
```

The `invisible` placeholder ensures the second row takes up space for alignment but shows nothing visually.

### Files Changed
- `src/components/editable-table/DraggableColumnHeader.tsx` -- increase header height from h-10 to h-12
- `src/config/employeeColumns.tsx` -- give every column a two-row renderHeader with invisible placeholders for non-total columns
