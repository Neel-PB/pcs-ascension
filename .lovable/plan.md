

# Fix: Department Filter Not Initializing to Assigned Value

## Problem Summary

When Demo Manager logs in, the Department filter shows "All Departments" (locked) instead of their assigned department "ICU" (locked). The lock icon appears correctly, but the selected value is wrong.

## Root Cause Analysis

**The issue is a timing/race condition** in the filter initialization:

1. `useOrgScopedFilters()` computes `defaultFilters.department` via `useMemo`
2. `StaffingSummary` effect checks `!orgScopedLoading` to run initialization
3. But the `useMemo` may not have recomputed yet with the loaded `departments` data

**Timeline of events:**
```text
1. Initial render: orgScopedLoading = true (waiting for data)
2. Access scope loads: scopeLoading = false, but filterLoading = true
3. Filter data loads: filterLoading = false
4. Effect runs with orgScopedLoading = false
5. BUT: useMemo may still have old `result` with empty departments
6. Effect sees defaultFilters.department = "all-departments"
7. Effect sets filtersInitialized = true
8. useMemo recomputes with departments, defaultFilters.department = "14452"
9. Effect doesn't re-run because filtersInitialized = true
```

**Additional issues found:**
- The `FilterBar.tsx` `getAvailableDepartments()` function has a bug where it checks `selectedFacility !== "all-facilities"` BEFORE checking department restrictions (line 145-147), which means when a facility is explicitly selected, it bypasses the access scope logic

---

## Technical Changes

### File 1: `src/pages/staffing/StaffingSummary.tsx`

**Change**: Make the initialization effect re-run when `defaultFilters` changes, even after initial initialization:

```typescript
// Current broken logic
useEffect(() => {
  if (!orgScopedLoading && !rbacLoading && !filtersInitialized && defaultFilters) {
    // Only runs once due to filtersInitialized flag
  }
}, [...]);

// Fixed logic - separate effect for applying defaults
useEffect(() => {
  if (!orgScopedLoading && !rbacLoading && defaultFilters) {
    // Apply defaults for RESTRICTED filters (those with lock icons)
    // These should always reflect the assigned value
    if (defaultFilters.department !== "all-departments") {
      setSelectedDepartment(defaultFilters.department);
    }
    if (defaultFilters.facility !== "all-facilities") {
      setSelectedFacility(defaultFilters.facility);
    }
    // etc.
  }
}, [orgScopedLoading, rbacLoading, defaultFilters]);
```

Alternatively, use a ref to track if we've handled a specific defaultFilters value:

```typescript
const lastAppliedDefaultsRef = useRef<string | null>(null);

useEffect(() => {
  const defaultsKey = JSON.stringify(defaultFilters);
  if (!orgScopedLoading && !rbacLoading && defaultFilters && lastAppliedDefaultsRef.current !== defaultsKey) {
    // Apply defaults...
    lastAppliedDefaultsRef.current = defaultsKey;
  }
}, [orgScopedLoading, rbacLoading, defaultFilters]);
```

### File 2: `src/hooks/useOrgScopedFilters.ts`

**Change**: Add a flag to ensure the result is stable before being consumed:

```typescript
// Add a computed "ready" flag that's only true when data is fully loaded
const isReady = !scopeLoading && !filterLoading && departments.length > 0;

return {
  ...result,
  isLoading: scopeLoading || filterLoading,
  isReady,  // New flag: true only when all data is loaded
};
```

Then in `StaffingSummary.tsx`, wait for `isReady` instead of just `!isLoading`.

### File 3: `src/components/staffing/FilterBar.tsx`

**Change**: Fix the priority check in `getAvailableDepartments()` - department restrictions should always take priority over UI selection:

```typescript
const getAvailableDepartments = () => {
  // PRIORITY 1: Department restrictions (most specific) - always wins
  // Even when a facility is selected, if user has department restrictions, honor them
  if (hasRestrictionAt('department')) {
    return restrictedOptions.availableDepartments;
  }
  
  // Then check if a specific facility is selected
  if (selectedFacility !== "all-facilities") {
    // But only if user doesn't have facility restrictions that would conflict
    return getDepartmentsByFacility(selectedFacility);
  }
  
  // ... rest of logic
};
```

---

## Expected Behavior After Fix

| User | Filter Shows | Selected Value | Lock Icon |
|------|-------------|----------------|-----------|
| Demo Manager (Dept: ICU) | "ICU" | "14452" | ✓ Yes |
| Demo Director (Market: Florida) | All depts in Florida facilities | "all-departments" | No |
| Admin | All departments | "all-departments" | No |

---

## Testing Verification

1. **Demo Manager login**:
   - Department dropdown should show "ICU" (not "All Departments")
   - Lock icon should appear
   - Data table should filter by department containing "ICU"

2. **Page refresh**: Filter should maintain the locked "ICU" value

3. **Tab switching**: Moving between Summary/Variance Analysis/Forecasts tabs should keep the filter value

