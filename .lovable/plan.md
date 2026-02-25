

## Filter KPI Tour Steps by Role in User Guides

### Problem
The Staffing Summary tour in User Guides shows steps for all KPI cards, including ones the current user's role cannot access (e.g., Director role cannot see 12M Average, Productive Resources KPIs).

### Solution
Filter out tour steps that reference hidden KPIs based on the user's roles, using the existing `isKpiVisible` function from `kpiVisibility.ts`.

### File Changes

| File | Change |
|------|--------|
| `src/components/support/UserGuidesTab.tsx` | Import `isKpiVisible` and `useUserRoles`, get current user's roles, filter steps that target hidden KPIs |

### Technical Details

1. Import `isKpiVisible` from `@/config/kpiVisibility` and `useUserRoles` from `@/hooks/useUserRoles`, and get the current user ID from `useAuth`.

2. In the `guidesWithSteps` memo, for the `staffing` tour key specifically, filter out steps whose `target` matches `[data-tour="kpi-{kpiId}"]` where `isKpiVisible(kpiId, userRoles)` returns `false`.

3. The KPI ID is extracted from the step target string using a regex like `/\[data-tour="kpi-(.+?)"\]/`. Steps without a KPI target (e.g., Filter Bar, Tab Navigation) pass through unchanged.

4. The filtered step list also updates the step count badge and the numbered step list, so users only see steps relevant to their role.

5. This reuses the same visibility rules already applied to the actual KPI cards on the Staffing Summary page, ensuring consistency.

### Mapping

Tour step targets like `[data-tour="kpi-12m-monthly"]` map to KPI IDs like `12m-monthly`. The `kpiVisibility.ts` rules hide these KPIs per role:
- **Director + Manager**: 12M Average, Paid FTEs, Contract FTEs, Overtime, PRN, NP%, Employed Productive FTEs
- **Director only**: 3M Low, 3M High

