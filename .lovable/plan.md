

## Issue: Submarket, Level 2, and PSTAT filters are not driven by the API

### Current State

- **Submarket**: Dynamically derived from `/filters/unique` API data via `getSubmarketsByMarket()`. This one works correctly.
- **Level 2**: **Hardcoded** list of 6 values in `FilterBar.tsx` (lines 108-115). Not sourced from the API.
- **PSTAT / Unit of Service**: **Hardcoded** list of 9 values in `FilterBar.tsx` (lines 95-105). Not sourced from the API. Worse, the hardcoded values (e.g., `"P Patient DaysAndObservation"`) likely **do not match** the actual API values (e.g., `"Pat Days + Obs"` seen in position data). This means selecting a PSTAT filter may send a value the API doesn't recognize, effectively returning no results or being silently ignored.

The `/filters/unique` API already returns `level_2` and `unit_of_service` fields in every row, but `useFilterData.ts` currently discards them during transformation.

### Fix

**1. `src/hooks/useFilterData.ts`** — Extract unique `level_2` and `unit_of_service` values from the flat rows alongside the existing region/market/facility/department extraction. Add cascade helpers (e.g., `getLevel2ByFacility`, `getPstatByFacility`) that filter these values based on the current filter selections. Return them from the hook.

**2. `src/components/staffing/FilterBar.tsx`** — Replace the two hardcoded arrays with the dynamic values from `useFilterData()`. Wire them through the existing cascade logic so Level 2 and PSTAT options narrow based on selected region/market/facility.

### Scope
Two files changed. No API changes needed — the data is already there, just not being used.

### Technical Detail

In `transformFlatRows`, collect unique level_2 and unit_of_service values per business_unit so the cascading works:

```text
FlatFilterRow[]
  ├── regions        (existing)
  ├── markets        (existing)
  ├── facilities     (existing)
  ├── departments    (existing, just fixed)
  ├── level2Values   (NEW: unique level_2 with facility_id linkage)
  └── pstatValues    (NEW: unique unit_of_service with facility_id linkage)
```

Cascade helpers will filter by selected region → market → facility, matching the existing pattern for departments.

