

## Role-Based KPI Visibility for Staffing Summary

### What This Does
Implements per-KPI visibility rules based on user roles, matching the uploaded spreadsheet. Different roles see different sets of KPI cards in the Staffing Summary tab.

### Visibility Rules Summary

**FTE Section (6 KPIs):** All roles see all 6 KPIs -- no filtering needed.

**Volume Section:**
- 12M Average: Hidden from Director and Manager
- 12M Daily Average: Visible to all
- 3M Low / 3M High: Hidden from Director only (Manager CAN see them)
- Target Vol / Override Vol: Visible to all

**Productive Resources Section:**
- ALL 6 KPIs (Paid FTEs, Employed Productive FTEs, Contract FTEs, Overtime FTEs, Total PRN, Total NP%): Hidden from Director and Manager
- The entire section is hidden if user is Director or Manager (since all cards would be empty)

### Implementation

**1. Create a KPI visibility config** (`src/config/kpiVisibility.ts`)

A simple map from KPI id to the list of roles that CANNOT see it:

```text
hiddenForRoles = {
  '12m-monthly':       ['director', 'manager'],
  '3m-low':            ['director'],
  '3m-high':           ['director'],
  'paid-ftes':         ['director', 'manager'],
  'contract-ftes':     ['director', 'manager'],
  'overtime-ftes':     ['director', 'manager'],
  'total-prn':         ['director', 'manager'],
  'total-np':          ['director', 'manager'],
  'total-fullpart-ftes': ['director', 'manager'],
}
```

Also export a helper: `isKpiVisible(kpiId, userRoles) => boolean`

**2. Update `StaffingSummary.tsx`**

- Import `isKpiVisible` and user roles from `useRBAC`
- Filter each KPI array (fteKPIs, volumeKPIs, productivityKPIs) through `isKpiVisible` before passing to `DraggableSectionsContainer`
- Conditionally hide the entire "Productive Resources" section if the filtered array is empty
- No changes to KPI card components themselves

### Files Changed

| File | Change |
|------|--------|
| `src/config/kpiVisibility.ts` | New file -- visibility rules map and helper function |
| `src/pages/staffing/StaffingSummary.tsx` | Filter KPI arrays based on user roles before rendering |

### Notes
- admin and labor_team see everything (they have no entries in the hidden map)
- The Workforce Drawer and Positions module KPIs are NOT affected by this change (separate request if needed)
- Drag-and-drop reordering continues to work on the visible subset of KPIs

