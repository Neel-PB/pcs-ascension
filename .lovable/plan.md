

## Unify Checklist Layout: Use 3-Tab Design in Staffing Module Too

### Current Behavior
- **Positions module** (Employees/Contractors/Requisitions tabs): Shows a clean 3-tab layout -- KPIs, Shortage, Surplus -- inside the checklist drawer.
- **Staffing module** (Summary/Planning/Variance/Forecasts tabs): Shows both Shortage and Surplus tables stacked vertically with no KPIs tab and no tab navigation.

### Change
Replace the stacked-tables layout in the Staffing module with the same 3-tab layout used in the Positions module. The only difference is that Staffing tabs won't have tab-specific KPIs (since there's no employee/contractor context), so the KPIs tab will show only the common KPI cards.

### File: `src/components/workforce/WorkforceKPISection.tsx`

1. Remove the `showBothTables` condition and the `ForecastTableWithTitle` sub-component entirely.
2. Change the `showForecastTables` check to always be true (or simply remove the conditional so the 3-tab layout renders for all `activeTab` values).
3. When `activeTab` is a Staffing tab (summary, planning, variance, forecasts), `tabSpecificKPIs` will already be empty (the `default` case returns `[]`), so the separator and extra KPI row will naturally be hidden -- no other logic changes needed.

This is a single-file change. The result is that both modules get the identical 3-tab (KPIs / Shortage / Surplus) experience.

