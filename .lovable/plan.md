
# Fix: Facility Filter Showing Empty for Director Role

## Problem

When logged in as Director, the Facility filter dropdown appears but shows no label/value (just an empty trigger). The selected value is `"40015"` but there's no matching option in the dropdown to display.

## Root Cause

This is a **data loading timing issue**:

1. The Director's Access Scope loads first with `facility_id: 40015`
2. The `useOrgScopedFilters` hook tries to filter the facilities list: `facilities.filter(f => accessScope.facilities.some(of => of.facilityId === f.facility_id))`
3. But when Access Scope loads BEFORE the full facilities list from `useFilterData`, `facilities` is still an empty array
4. Result: `restrictedOptions.availableFacilities = []` (empty)
5. The Radix Select component has value `"40015"` but no matching `<SelectItem>` to display

## Solution

Ensure the Access Scope hook waits for filter data to be fully loaded before computing restricted options, OR fall back to using the Access Scope's own facility data for display.

### Approach: Use Access Scope Data Directly for Display When Filter Data is Loading

In `FilterBar.tsx`, when the filter data is still loading but we have Access Scope data, use the Access Scope's facility names directly instead of trying to match against the (empty) facilities array.

---

## Files to Modify

### 1. `src/hooks/useOrgScopedFilters.ts`

Update the hook to handle the case where Access Scope data exists but filter data hasn't loaded yet. Use the Access Scope's own facility names for display rather than requiring a join with the facilities table.

**Current behavior (lines 100-105):**
```typescript
const availableFacilities = accessScope.hasFacilityRestriction
  ? facilities.filter(f => 
      accessScope.facilities.some(of => of.facilityId === f.facility_id)
    )
  : facilities;
```

**Fixed behavior:**
```typescript
// If we have facility restrictions but facilities array is empty (still loading),
// use the Access Scope's own facility data directly
const availableFacilities = accessScope.hasFacilityRestriction
  ? (facilities.length > 0 
      ? facilities.filter(f => 
          accessScope.facilities.some(of => of.facilityId === f.facility_id)
        )
      : accessScope.facilities.map(f => ({
          facility_id: f.facilityId,
          facility_name: f.facilityName,
          id: f.facilityId,
        }))
    )
  : facilities;
```

Apply the same pattern for departments:
```typescript
const availableDepartments = accessScope.hasDepartmentRestriction
  ? (departments.length > 0
      ? departments.filter(d => 
          accessScope.departments.some(od => od.departmentId === d.department_id)
        )
      : accessScope.departments.map(d => ({
          department_id: d.departmentId,
          department_name: d.departmentName,
        }))
    )
  : departments;
```

---

## Expected Outcome

| Role | Before Fix | After Fix |
|------|-----------|-----------|
| Director | Empty facility dropdown, no label visible | Shows "St. Vincent Indianapolis Hospital" in dropdown |
| Manager | Empty department dropdown if loaded before filter data | Shows "ICU" in dropdown |
| Labor Team | Works correctly | No change |

The fix ensures that even if filter data is still loading, users with Access Scope restrictions will see their assigned facilities/departments displayed correctly in the filter bar.
