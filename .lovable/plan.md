

# Rename "Requisitions" to "Open Positions" & Remove KPI Summary Modal

## Overview

Two changes requested for the Positions module:
1. Rename the "Requisitions" tab to "Open Positions"
2. Remove the KPI Summary icon button and its functionality from all three tabs (Employees, Contractors, Open Positions)

---

## Changes Summary

### 1. Rename Tab Label (PositionsPage.tsx)

Update the tabs array to change the label from "Requisitions" to "Open Positions":

```typescript
const tabs = [
  { id: "employees", label: "Employees" },
  { id: "contractors", label: "Contractors" },
  { id: "requisitions", label: "Open Positions" },  // Changed from "Requisitions"
];
```

### 2. Remove KPI Summary Modal from All Tabs

Remove the `<KPISummaryModal />` component and its import from:
- `EmployeesTab.tsx`
- `ContractorsTab.tsx`  
- `RequisitionsTab.tsx`

---

## Technical Details

| File | Change |
|------|--------|
| `src/pages/positions/PositionsPage.tsx` | Change tab label from "Requisitions" to "Open Positions" |
| `src/pages/positions/EmployeesTab.tsx` | Remove `KPISummaryModal` import and component usage |
| `src/pages/positions/ContractorsTab.tsx` | Remove `KPISummaryModal` import and component usage |
| `src/pages/positions/RequisitionsTab.tsx` | Remove `KPISummaryModal` import and component usage |

---

## UI Impact

### Before:
- Tabs: Employees | Contractors | **Requisitions**
- Toolbar: DataRefresh | **KPI Summary** | Column Visibility | Filters

### After:
- Tabs: Employees | Contractors | **Open Positions**
- Toolbar: DataRefresh | Column Visibility | Filters

