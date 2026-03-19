

## Fix Level 2 and PSTAT Filters to Cascade by Department

**Problem**: When a department is selected, Level 2 and PSTAT dropdowns still show all values for that facility instead of narrowing to the single value mapped to that department. The API flat rows contain `department_id` alongside `level_2` and `unit_of_service`, but this association is discarded during transformation.

### Changes

**1. `src/hooks/useFilterData.ts`** — Store `department_id` in Level2/PSTAT data and add department filtering

- Add `department_id` to `Level2Value` and `PstatValue` interfaces
- Update `transformFlatRows` to capture `department_id` in level2 and pstat maps, using finer dedupe keys (`level_2|business_unit|department_id` and `unit_of_service|business_unit|department_id`)
- Update `getLevel2Options` and `getPstatOptions` to accept an optional `departmentId` parameter. When set (and not "all-departments"), filter by `department_id` first, before falling through to facility/market/region cascading

**2. `src/components/staffing/FilterBar.tsx`** (line 97-98) — Pass `selectedDepartment` to helpers

```tsx
// Before
const pstatOptions = getPstatOptions(selectedFacility, selectedMarket, selectedRegion);
const level2Options = getLevel2Options(selectedFacility, selectedMarket, selectedRegion);

// After
const pstatOptions = getPstatOptions(selectedFacility, selectedMarket, selectedRegion, selectedDepartment);
const level2Options = getLevel2Options(selectedFacility, selectedMarket, selectedRegion, selectedDepartment);
```

Since department selection requires a facility to be selected first, the department filter naturally works alongside the facility filter — the department narrows results within the already-selected facility.

