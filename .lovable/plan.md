
# Fix: Variance Analysis Must Respect Access Scope

## Problem Summary

The Variance Analysis tab for Demo Manager shows data from markets/facilities outside the user's authorized Access Scope. The filter dropdown shows "All Departments" because the user has multiple department assignments, but the table should only display data for the assigned departments.

## Demo Manager's Actual Access Scope (from DB)

| Facility | Facility Name | Department | Department Name |
|----------|---------------|------------|-----------------|
| 52005 | St. Vincent's Southside | 14452 | ICU |
| 52005 | St. Vincent's Southside | (facility-only) | - |
| 26012 | ASH Pensacola Hospital | 10298 | Adult ECMO 001 |
| 26012 | ASH Pensacola Hospital | 10277 | Bariatric Surgical Unit 001 |
| 26012 | ASH Pensacola Hospital | 11012 | Cardiac Care |

**Most Specific Assignment Wins Rule:**
- Facility 52005: Has department "ICU" → Only show "ICU" (department wins over facility-level)
- Facility 26012: Has 3 specific departments → Only show those 3 departments

**Result**: Demo Manager should see exactly 4 departments across 2 facilities.

---

## Root Cause Analysis

### Issue 1: Filter Dropdown Shows "All Departments"
Since the user has 4 assigned departments, `availableDepartments.length !== 1`, so the default is "all-departments" and the filter isn't locked.

**However**: "All Departments" in this context should mean "All of MY assigned departments" - which is only 4, not ALL departments in the database.

### Issue 2: Variance Analysis Doesn't Use Access Scope
The `VarianceAnalysis.tsx` component:
- Uses `useFilterData()` directly (fetches ALL regions/markets/facilities/departments)
- Cascades based on UI selection, not Access Scope
- When `selectedDepartment === "all-departments"`, it shows ALL facilities/markets

**Expected behavior**: When `selectedDepartment === "all-departments"`:
- The table should still only show data for the user's 4 authorized departments
- NOT all departments in the database

---

## Technical Changes

### File 1: `src/pages/staffing/VarianceAnalysis.tsx`

**Change**: Integrate Access Scope filtering into the component's data generation logic.

```typescript
// Current (line 22):
import { useFilterData } from "@/hooks/useFilterData";

// Add:
import { useOrgScopedFilters } from "@/hooks/useOrgScopedFilters";

// In component (around line 87):
const { 
  restrictedOptions, 
  hasRestrictions, 
  hasRestrictionAt 
} = useOrgScopedFilters();

// Modify getData() to filter by Access Scope when "all" is selected:
const getData = (): GroupedVarianceData[] => {
  // STEP 1: If user has department restrictions, filter to only authorized departments
  if (hasRestrictionAt('department') && selectedDepartment === "all-departments") {
    // Show only the user's authorized departments, grouped by their facilities
    const authorizedDepts = restrictedOptions.availableDepartments;
    // Group by facility and return as rows
    return authorizedDepts.map((dept, idx) => ({
      name: dept.department_name,
      subText: dept.department_id,
      ...generateVariance(),
      type: 'skill' as const,
      id: `dept-${idx}`,
    }));
  }
  
  // STEP 2: If specific department selected (or no restrictions), continue normal flow
  // ... existing logic
};
```

### File 2: Cascade Through Facilities/Markets

When user has facility-level restrictions but no department filter is selected:

```typescript
// Modify getData() to also check facility restrictions:
if (hasRestrictionAt('facility') && selectedFacility === "all-facilities") {
  // Show only facilities the user has access to
  const authorizedFacilities = restrictedOptions.availableFacilities;
  // ... generate data only for these facilities
}
```

### File 3: `src/components/staffing/FilterBar.tsx`

**Change**: Ensure the dropdown label shows "All Departments" with a count indicator when user has multiple assignments:

```typescript
// When department has restrictions and multiple options exist:
// Show "All Departments (4)" or similar to indicate the user's scope
```

---

## Expected Behavior After Fix

### Demo Manager's View

| Filter State | Table Shows |
|--------------|-------------|
| Department = "All Departments" | 4 rows: ICU, Adult ECMO 001, Bariatric Surgical Unit 001, Cardiac Care |
| Department = "ICU" | 1 row: ICU only |
| Clear Filters | Returns to "All Departments" showing their 4 authorized departments |

### Variance Analysis Data Scope

| User | Authorized Scope | Table Content |
|------|------------------|---------------|
| Demo Manager | 4 departments in 2 facilities | Only those 4 departments |
| Demo Director | Markets: INDIANA, ILLINOIS, FLORIDA | All facilities/departments in those markets |
| Admin | All | All regions/markets/facilities |

---

## Testing Verification

1. **Demo Manager Login**:
   - Variance Analysis should show exactly 4 department rows
   - No data from unauthorized facilities (e.g., FLJAC shouldn't appear if not in scope)
   - Clear Filters → still shows only the 4 authorized departments

2. **Demo Director Login**:
   - Variance Analysis should show all data from their authorized markets only
   - Facilities outside Indiana/Illinois/Florida should NOT appear

3. **Admin Login**:
   - No restrictions - sees all regions/markets/facilities as before
