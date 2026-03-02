

## Fix: Pass Location Filters to Positions API

### Problem
The `usePositionsByFlag` hook currently only sends `flag`, `value`, `limit`, and `offset` to the API. The location filters (region, market, facility, department) from the FilterBar are received but never appended as query parameters, so the API always returns unfiltered data.

### Solution
Update `src/hooks/usePositionsByFlag.ts` to conditionally append filter values as query parameters, skipping sentinel values (e.g., `"all-regions"`, `"all-markets"`).

### Change

**File: `src/hooks/usePositionsByFlag.ts`**

After constructing the base `URLSearchParams`, append each filter only when it holds a real value (not a sentinel):

```text
Before:
  GET /positions?flag=employee_flag&value=true&limit=1000&offset=0

After (with filters selected):
  GET /positions?flag=employee_flag&value=true&limit=1000&offset=0&region=East&market=Florida
```

Logic:
- Import `FILTER_SENTINELS` from `@/lib/selectConstants`
- After creating `params`, check each filter against its sentinel value
- Only append if the value differs from the sentinel (e.g., `selectedRegion !== "all-regions"`)
- Map: `selectedRegion` -> `region`, `selectedMarket` -> `market`, `selectedFacility` -> `facility`, `selectedDepartment` -> `department`

This is a single-file, ~10-line change. The query key already includes all filter values, so React Query will automatically refetch when any filter changes.
