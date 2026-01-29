
# Pass Filters to Forecast Tab

## Problem

The Forecast tab is not respecting the department filter (or any other filters). When "ICU" is selected in the department dropdown, the Forecast table still shows data for all departments (OB High Risk Unit, Critical Care Unit, Mother Baby Unit, etc.).

---

## Root Cause

The `ForecastTab` component calls `useForecastBalance()` without any filter parameters, even though:

1. The hook already supports filters (`departmentId`, `region`, `market`, `facilityId`, `level2`, `pstat`)
2. The parent `StaffingSummary` component has all the filter state available
3. Other tabs like `VarianceAnalysis` already receive filter props

---

## Solution

Pass the filter state from `StaffingSummary` to `ForecastTab`, then pass those filters to `useForecastBalance`.

---

## Technical Changes

| File | Change |
|------|--------|
| `src/pages/staffing/ForecastTab.tsx` | Add filter props interface; pass filters to `useForecastBalance` hook |
| `src/pages/staffing/StaffingSummary.tsx` | Pass filter values as props to `<ForecastTab />` |

---

## Implementation Details

### 1. Update ForecastTab to Accept Filter Props

Add a props interface matching the filter parameters that `useForecastBalance` expects:

```typescript
interface ForecastTabProps {
  selectedRegion?: string;
  selectedMarket?: string;
  selectedFacility?: string;
  selectedDepartment?: string;
  selectedLevel2?: string;
  selectedPstat?: string;
}
```

Transform the filter values (handling "all-" prefixes) and pass to the hook:

```typescript
const filters = {
  region: selectedRegion !== "all-regions" ? selectedRegion : null,
  market: selectedMarket !== "all-markets" ? selectedMarket : null,
  facilityId: selectedFacility !== "all-facilities" ? selectedFacility : null,
  departmentId: selectedDepartment !== "all-departments" ? selectedDepartment : null,
  level2: selectedLevel2 !== "all-level2" ? selectedLevel2 : null,
  pstat: selectedPstat !== "all-pstat" ? selectedPstat : null,
};

const { data, isLoading } = useForecastBalance(filters);
```

### 2. Update StaffingSummary to Pass Filters

Change the ForecastTab rendering from:
```tsx
<ForecastTab />
```

To:
```tsx
<ForecastTab
  selectedRegion={selectedRegion}
  selectedMarket={selectedMarket}
  selectedFacility={selectedFacility}
  selectedDepartment={selectedDepartment}
  selectedLevel2={selectedLevel2}
  selectedPstat={selectedPstat}
/>
```

---

## Expected Result

| Before | After |
|--------|-------|
| Selecting "ICU" shows all departments | Selecting "ICU" shows only ICU-related data |
| KPI totals include all data | KPI totals reflect filtered data only |
| Filters have no effect on Forecast tab | All filters work consistently across tabs |
