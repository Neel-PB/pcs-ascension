

## Fix: Use `editable` flag instead of `renderCell` for stopPropagation

### Problem
Currently, clicking ANY column with `renderCell` (Employee Name, Job Title, Skill Mix, Status, Staff Type) does NOT open the detail sheet because `stopPropagation` fires on all of them. Only Active FTE, Shift, and Comments are truly interactive and need it.

### Solution
Use the existing `editable` property on `ColumnDef` to mark interactive columns. Only those get `stopPropagation`.

**1. `src/components/editable-table/TableRow.tsx` (line 66)**

Change the condition from `column.renderCell` to `column.editable`:
```tsx
onClick={column.editable ? (e) => e.stopPropagation() : undefined}
```

**2. Mark interactive columns as `editable: true` in column configs:**

- **`src/config/employeeColumns.tsx`**: Add `editable: true` to `actual_fte` (line ~76) and `shift` (line ~88)
- **`src/config/employeeColumns.tsx`**: Add `editable: true` to the `comments` column (~line 155)
- **`src/config/contractorColumns.tsx`**: Add `editable: true` to the `comments` column in `createContractorColumnsWithComments`
- **`src/config/requisitionColumns.tsx`**: Add `editable: true` to `shift` (if editable) and `comments` columns

Display-only columns (Employee Name, Job Title, Skill Mix, Status, Staff Type) keep `editable` unset/false, so clicks pass through to the row handler and open the detail sheet.

