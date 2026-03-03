

## Restructure All Position Tab Columns

Based on your requirements, here are the exact column specs for each tab with the differences from what's currently implemented.

### Summary of Changes Needed

**New column "Skill Mix"** added to ALL 5 tabs -- uses the `jobFamily` field, displayed as a text cell.

**"Vacancy Age"** added to Open Reqs, Open Position, and Contractor Requisition tabs -- uses the existing badge-based display from `requisitionColumns.tsx`.

**Editability differences** for Shift column across tabs (some editable, some read-only).

**Label changes**: "Name" stays for Employee tab ("Employee Name"), Contractor tab gets "Contractor Name".

---

### Tab-by-Tab Column Specifications

**1. Employee Table** (`src/config/employeeColumns.tsx`)
| Column | Field | Current | Change |
|--------|-------|---------|--------|
| Position No | positionNum | Exists | No change |
| Employee Name | employeeName | Label says "Name" | Rename to "Employee Name" |
| Job Title | jobTitle | Exists | No change |
| Skill Mix | jobFamily | MISSING | Add new column |
| Hired FTE | FTE | Exists | No change |
| Active FTE | actual_fte | Exists | No change |
| Shift | shift | Editable | No change (keep editable) |
| Status | payrollStatus | Exists | No change |
| Staff Type | employmentType | Currently 4th | Move to last position |

**2. Contractor Table** (`src/config/contractorColumns.tsx`)
| Column | Field | Current | Change |
|--------|-------|---------|--------|
| Position No | positionNum | Exists | No change |
| Contractor Name | employeeName | Label says "Name" | Rename to "Contractor Name" |
| Job Title | jobTitle | Exists | No change |
| Skill Mix | jobFamily | MISSING | Add new column |
| Hired FTE | FTE | Exists | Make NOT editable (display only) |
| Shift | shift | Currently editable | Make NOT editable (read-only ShiftCell) |
| Status | payrollStatus | Exists | No change |
| Staff Type | employmentType | Currently 4th | Move to last position |

**3. Open Reqs** (`src/pages/positions/OpenRequisitionTab.tsx`)
| Column | Field | Current | Change |
|--------|-------|---------|--------|
| Position No | positionNum | Exists | No change |
| Job Title | jobTitle | Exists | No change |
| Skill Mix | jobFamily | MISSING | Add new column |
| Vacancy Age | positionStatusDate | MISSING | Add with badge display |
| Hired FTE | FTE | Exists | No change |
| Shift | shift | Currently read-only | Make EDITABLE |
| Staff Type | employmentType | Exists | No change |

**4. Open Position** (`src/config/requisitionColumns.tsx` + `RequisitionsTab.tsx`)
| Column | Field | Current | Change |
|--------|-------|---------|--------|
| Position No | positionNum | Label says "Position #" | Rename to "Position No" |
| Job Title | jobTitle | Exists | No change |
| Skill Mix | jobFamily | MISSING | Add new column |
| Vacancy Age | positionStatusDate | Exists | No change |
| Hired FTE | FTE | MISSING | Add (not editable) |
| Shift | shift | Exists | Keep NOT editable |
| Staff Type | employmentType | Label says "Employment Type" | Rename to "Staff Type" |
| Remove | positionLifecycle | Exists | Remove this column |

**5. Contractor Requisition** (`src/pages/positions/ContractorRequisitionTab.tsx`)
| Column | Field | Current | Change |
|--------|-------|---------|--------|
| Position No | positionNum | Exists | No change |
| Job Title | jobTitle | Exists | No change |
| Skill Mix | jobFamily | MISSING | Add new column |
| Vacancy Age | positionStatusDate | MISSING | Add with badge display |
| Hired FTE | FTE | Exists | No change |
| Shift | shift | Currently read-only | Keep NOT editable |
| Staff Type | employmentType | Exists | No change |

---

### Files to Modify

1. **`src/config/employeeColumns.tsx`** -- Rename "Name" to "Employee Name", add Skill Mix column after Job Title, move Staff Type to end
2. **`src/config/contractorColumns.tsx`** -- Rename "Name" to "Contractor Name", add Skill Mix column, move Staff Type to end, remove shift editability from `createContractorColumnsWithComments` (keep read-only ShiftCell)
3. **`src/config/requisitionColumns.tsx`** -- Rename "Position #" to "Position No", rename "Employment Type" to "Staff Type", remove "Position Lifecycle" column, add "Hired FTE" column, add "Skill Mix" column
4. **`src/pages/positions/OpenRequisitionTab.tsx`** -- Add Skill Mix, Vacancy Age columns, make Shift editable (add shift override handler), reorder columns
5. **`src/pages/positions/ContractorRequisitionTab.tsx`** -- Add Skill Mix, Vacancy Age columns, reorder columns
6. **`src/pages/positions/RequisitionsTab.tsx`** -- The vacancyAge computation already exists here; columns come from requisitionColumns.tsx so changes propagate automatically

### Technical Notes

- "Skill Mix" uses the `jobFamily` field from the API data, rendered as a `TruncatedTextCell`
- "Vacancy Age" uses `differenceInDays(now, positionStatusDate)` with the existing color-coded badge (green/amber/orange)
- For Open Reqs editable Shift: will need to wire up `useUpdateShiftOverride` hook and pass handler, similar to Employee/Contractor tabs
- Contractor tab: `createContractorColumnsWithComments` will no longer override the shift column with an editable version
- Comments column remains appended dynamically at the end for Employee, Contractor, and Open Position tabs
