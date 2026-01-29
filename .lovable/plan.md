
# Fix: Filters Showing Empty for Restricted Roles

## Problem Summary

When logged in as Director (or other restricted roles), the Facility filter dropdown shows empty text (just a lock icon) despite having a facility assigned. The user expects to see their assigned facility name in the filter.

## Root Cause Analysis

There's a **timing mismatch** between the selected filter value and the available dropdown options:

1. **Initial state**: `selectedFacility = "all-facilities"`
2. **Access Scope loads**: Director is assigned to facility `40015` (St. Vincent Indianapolis Hospital)
3. **`shouldShowAllOption('facility')` returns `false`**: Because user has only 1 facility, the "All Facilities" option is hidden
4. **First render happens**: FilterBar receives `selectedFacility="all-facilities"` but no matching `<SelectItem>` exists in the dropdown
5. **Effect runs after render**: `setSelectedFacility("40015")` is called
6. **Second render**: Now shows correctly, BUT there's a visual flash of empty state

The Radix Select component requires a matching `SelectItem` to display the label. When `selectedFacility="all-facilities"` but there's no "All Facilities" option (because it's hidden for restricted users), the Select shows nothing.

## Solution

Initialize filter state directly from Access Scope **synchronously** rather than using a delayed `useEffect`. This ensures the first render already has the correct value.

### Approach: Provide Initial Values from Hook

Modify `useOrgScopedFilters` to return the initial state values that pages should use, and have pages use these directly as initial state.

---

## Files to Modify

### 1. `src/hooks/useOrgScopedFilters.ts`

Add a new property `initialFilters` that can be used as React state initial values:

```typescript
export interface AccessScopedFiltersResult {
  // ... existing properties
  
  // Initial filter values for use in useState - matches defaults when ready
  initialFilters: AccessScopeFilterDefaults;
}
```

Update the return value to always include the computed defaults.

### 2. `src/pages/staffing/StaffingSummary.tsx`

Use a different pattern where we wait for the hook to be ready before initializing state:

Option A - Keep showing loader until filters are initialized AND the selected values are applied:
```typescript
// Instead of initializing to "all-*" values, use a "pending" approach
const [selectedFacility, setSelectedFacility] = useState<string | null>(null);

// In the effect, set the actual value
useEffect(() => {
  if (!orgScopedLoading && !rbacLoading && selectedFacility === null) {
    setSelectedFacility(defaultFilters.facility);
  }
}, [...]);

// Show loader while facility is null
if (selectedFacility === null) {
  return <LogoLoader />;
}
```

Option B (Simpler) - Add "All Facilities" option back when the selected value doesn't match any option:

In `FilterBar.tsx`, always render the "All Facilities" option if the current value is `"all-facilities"`, even if `shouldShowAllOption` returns false:

```typescript
{(shouldShowAllOption('facility') || selectedFacility === 'all-facilities') && (
  <SelectItem value="all-facilities">All Facilities</SelectItem>
)}
```

### 3. `src/pages/positions/PositionsPage.tsx`

Apply the same fix as StaffingSummary.

---

## Recommended Solution: Option B

The simplest fix is to ensure the dropdown always has a matching option for the current value, even during the brief initialization period. This prevents the empty state flash without requiring major restructuring.

### Change 1: `src/components/staffing/FilterBar.tsx` (line 253)

```typescript
// Before:
{shouldShowAllOption('facility') && (
  <SelectItem value="all-facilities">All Facilities</SelectItem>
)}

// After:
{(shouldShowAllOption('facility') || selectedFacility === 'all-facilities') && (
  <SelectItem value="all-facilities">All Facilities</SelectItem>
)}
```

Apply similar logic to Region, Market, and Department selects.

### Change 2: Similar fix for all filter dropdowns

Apply the same pattern to:
- Region filter (line 177-179)
- Market filter (line 213-215)  
- Department filter (line 293-295)

---

## Expected Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Director first render | Empty facility dropdown, then fills in | Shows "All Facilities" briefly, then shows assigned facility |
| Manager first render | Empty department dropdown | Shows "All Departments" briefly, then shows assigned department |
| Labor Team | Works correctly | No change |

The brief "All X" flash during initialization is acceptable and much better than showing an empty/broken dropdown.

---

## Alternative Enhancement (Future)

For a completely seamless experience, the loading guard could be extended to wait for both:
1. RBAC permissions to load
2. Access Scope to load  
3. **Filter state to be synchronized with Access Scope defaults**

This would require tracking a `filtersReady` state that becomes true after the initial useEffect runs and state is applied.
