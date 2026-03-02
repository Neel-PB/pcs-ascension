

## Restructure Column Definitions Across All Position Tabs

### Summary of Changes

Updating column order, labels, and visibility for all four tabs to match the specified layout.

---

### Employees Tab (`src/config/employeeColumns.tsx`)

Current order: Position #, Employee Name, Job Title, Hired FTE, Active FTE, Shift, Status, Full/Part Time

New order:
1. Position No (rename from "Position #")
2. Name (rename from "Employee Name")
3. Job Title
4. Staff Type (rename "Full/Part Time", move before Hired FTE)
5. Hired FTE
6. Active FTE
7. Shift
8. Status

---

### Contractors Tab (`src/config/contractorColumns.tsx`)

Current order: Position #, Contractor Name, Job Title, Hired FTE, Active FTE, Shift, Status, Full/Part Time

New order (remove Active FTE column entirely):
1. Position No
2. Name (rename from "Contractor Name")
3. Job Title
4. Staff Type (rename "Full/Part Time", move up)
5. Hired FTE
6. Shift
7. Status (keep existing payrollStatus badge)

---

### Open Requisitions Tab (`src/pages/positions/OpenRequisitionTab.tsx`)

Current: Requisition #, Job Title, Shift, Employment Type, Status

New order (switch to positionNum, add Hired FTE, remove Status):
1. Position No (use `positionNum` field instead of `requisitionNum`)
2. Job Title
3. Staff Type (rename from "Employment Type")
4. Hired FTE (new column)
5. Shift

---

### Contractor Requisitions Tab (`src/pages/positions/ContractorRequisitionTab.tsx`)

Current: Requisition #, Job Title, Shift, Employment Type, Status

New order (same changes as Open Requisitions):
1. Position No (use `positionNum` instead of `requisitionNum`)
2. Job Title
3. Staff Type (rename from "Employment Type")
4. Hired FTE (new column)
5. Shift

---

### Technical Notes

- The `requisitionColumns.tsx` file (used by the "Open Position" / "Requisitions" tab) also has extra columns like Position Lifecycle and Vacancy Age. Need to confirm whether the RequisitionsTab uses that config or inline columns -- will check during implementation.
- The Comments column (appended dynamically via `createXColumnsWithComments`) is preserved in Employee and Contractor tabs as before.
- Column `storeNamespace` keys remain unchanged so saved user preferences persist; however, column order changes may reset user customizations.
