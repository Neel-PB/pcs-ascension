

## Standardize Position Tab Filters

### Current State
- Employee and Contractor tabs have filter sheets with inconsistent filter sets (text inputs for Job Family, number inputs for FTE)
- Open Position tab (RequisitionsTab) has a filter sheet with vacancy age/lifecycle filters that don't match its columns
- Open Requisition and Contractor Requisition tabs have non-functional filter buttons (no sheet wired)

### Plan

**Create one unified `PositionsFilterSheet` component** that all 5 tabs share. It accepts a config flag for whether to show the Status filter.

**Filters (all dropdowns):**

| Filter | Field | Options | Tabs |
|--------|-------|---------|------|
| Skill Mix | jobFamily | Dynamic from data | All 5 |
| Staff Type | employmentType | Full-Time, Part-Time, PRN | All 5 |
| Shift | shift | Day, Night, Evening, Rotating, Weekend Options | All 5 |
| FTE Range | FTE (min/max) | Two dropdowns: 0.1, 0.2, ... 1.0 | All 5 |
| Status | payrollStatus | Active, Leave With Pay, Suspended | Employee, Contractor only |
| Employee Type | employeeType | Dynamic from data | All 5 |

**Files to create:**
- `src/components/positions/PositionsFilterSheet.tsx` -- unified filter sheet

**Files to modify:**
- `src/pages/positions/EmployeesTab.tsx` -- swap EmployeesFilterSheet for PositionsFilterSheet, update filter state/logic
- `src/pages/positions/ContractorsTab.tsx` -- same
- `src/pages/positions/RequisitionsTab.tsx` (Open Position) -- same, remove vacancy age/lifecycle filters
- `src/pages/positions/OpenRequisitionTab.tsx` -- add filter state, wire PositionsFilterSheet
- `src/pages/positions/ContractorRequisitionTab.tsx` -- add filter state, wire PositionsFilterSheet

**Files to delete (no longer needed):**
- `src/components/positions/EmployeesFilterSheet.tsx`
- `src/components/positions/ContractorsFilterSheet.tsx`
- `src/components/positions/RequisitionsFilterSheet.tsx`

Dynamic dropdown values (Skill Mix, Employee Type) will be extracted from the loaded position data using `useMemo` to get unique values.

