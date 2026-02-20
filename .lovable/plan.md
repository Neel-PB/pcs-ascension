

## Restructure Positions Module to 5 Tabs

### Current State
- 3 tabs: Employees, Contractors, Open Positions (requisitions)
- All pull from the `positions` table with different filters

### Changes

**1. Update tab definitions in PositionsPage.tsx**

Replace the 3-tab array with 5 tabs:
1. **Employees** -- same as today (filled, non-contingent)
2. **Open Requisition** -- placeholder/dummy data tab (new)
3. **Open Position** -- current requisitions tab renamed (unfilled positions from `positions` table)
4. **Contractor** -- same as today (filled, contingent)
5. **Contractor Requisition** -- placeholder/dummy data tab (new)

Update `validTabs` array and conditional rendering accordingly.

**2. Create two new placeholder tab components**

- `src/pages/positions/OpenRequisitionTab.tsx` -- shows a table with dummy requisition data (hardcoded array of ~5 sample rows) with columns: Requisition #, Job Title, Shift, Employment Type, Status, Comments
- `src/pages/positions/ContractorRequisitionTab.tsx` -- same structure with dummy contractor requisition data

Both will use the existing `EditableTable` component with a simplified column set (no Job Family, no Staff Type).

**3. Remove "Job Family" and "Staff Type" columns from all tabs**

- `src/config/employeeColumns.tsx` -- remove `jobFamily` (id: `'jobFamily'`) and `employmentFlag` (id: `'employmentFlag'`, label: "Staff Type") columns
- `src/config/contractorColumns.tsx` -- remove `jobFamily` and `employmentFlag` columns
- `src/config/requisitionColumns.tsx` -- remove `jobFamily` column (no Staff Type column exists here)

**4. Update related references**

- `src/components/shell/TabNavigation.tsx` -- update `moduleTabConfigs.positions` to reflect 5 tabs
- `src/components/support/UserGuidesTab.tsx` -- add guide entries for the 2 new tabs if needed
- Tour step references for positions may need updating but can remain functional

### Technical Details

| File | Change |
|------|--------|
| `src/pages/positions/PositionsPage.tsx` | Update tabs array to 5 items, add imports for new tab components, add conditional renders |
| `src/pages/positions/OpenRequisitionTab.tsx` | New file -- placeholder tab with dummy data table |
| `src/pages/positions/ContractorRequisitionTab.tsx` | New file -- placeholder tab with dummy data table |
| `src/config/employeeColumns.tsx` | Remove `jobFamily` and `employmentFlag` column definitions |
| `src/config/contractorColumns.tsx` | Remove `jobFamily` and `employmentFlag` column definitions |
| `src/config/requisitionColumns.tsx` | Remove `jobFamily` column definition |
| `src/components/shell/TabNavigation.tsx` | Update `moduleTabConfigs.positions` to list 5 tabs |

