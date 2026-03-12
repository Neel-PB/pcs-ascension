

## Plan: Two Changes

### 1. Transform flat API response in `useFilterData`

The `/filters/unique` API now returns flat denormalized rows like:
```json
{ "region": "Region 1", "market": "Baltimore", "submarket": "MDBAL", "business_unit": "32022", "business_unit_description": "St Agnes Healthcare", "department_id": "10162", "department_description": "Mother Baby Unit 001", ... }
```

**`src/hooks/useFilterData.ts`** — Rewrite the `queryFn` to:
1. Fetch the flat array from `/filters/unique`
2. Extract unique regions (dedupe by `region` field) → `Region[]`
3. Extract unique markets (dedupe by `market`, keep `region` reference) → `Market[]`
4. Extract unique facilities (dedupe by `business_unit`, map `business_unit` → `facility_id`, `business_unit_description` → `facility_name`, keep `market`, `region`, `submarket`) → `Facility[]`
5. Extract unique departments (dedupe by `department_id`, map `department_description` → `department_name`, keep `business_unit` → `facility_id`) → `Department[]`

All existing helper functions (`getMarketsByRegion`, `getFacilitiesByMarket`, `getDepartmentsByFacility`, `getSubmarketsByMarket`) continue to work unchanged because the output shape is preserved.

### 2. Hide optional filters on Positions module

**`src/components/staffing/FilterBar.tsx`**:
- Add prop `hideOptionalFilters?: boolean` (default `false`)
- When `true`, skip rendering the separator and the optional filters section (Submarket, Level2, Pstat)

**`src/pages/positions/PositionsPage.tsx`**:
- Pass `hideOptionalFilters` to `FilterBar`

### Scope
2 files changed significantly (`useFilterData.ts`, `FilterBar.tsx`), 1 file minor (`PositionsPage.tsx`).

