
## Remove Column Visibility Panel

### What's being removed
The "Column Visibility" side sheet that opens when clicking the columns icon button on the Employees, Contractors, and Requisitions tabs. This panel lets users show/hide table columns -- the user wants it gone entirely.

### Changes

**1. Delete the component file**
- `src/components/editable-table/ColumnVisibilityPanel.tsx` -- delete entirely

**2. Remove usage from `src/pages/positions/EmployeesTab.tsx`**
- Remove the `ColumnVisibilityPanel` import (line 13)
- Remove the `<ColumnVisibilityPanel>` JSX block (lines 278-282)

**3. Remove usage from `src/pages/positions/ContractorsTab.tsx`**
- Remove the `ColumnVisibilityPanel` import (line 13)
- Remove the `<ColumnVisibilityPanel>` JSX block (lines 272-276)

**4. Remove usage from `src/pages/positions/RequisitionsTab.tsx`**
- Remove the `ColumnVisibilityPanel` import (line 13)
- Remove the `<ColumnVisibilityPanel>` JSX block (lines 219-223)

No other files reference this component. The underlying `useColumnStore` and column state logic remain intact since they also handle column widths and reordering used by the table itself.
