
# Fix Global Filters Not Showing Options (Market, Facility, Department)

## Problem Identified

After testing, the filters work correctly for Admin users with no restrictions. However, the issue occurs when:

1. **User has organization access restrictions** at one level (e.g., facility), which causes:
   - `hasMarketRestriction` to become `true` (because facility records include market values)
   - But the user's actual markets are limited to only those from their facility entries
   
2. **The fallback logic in FilterBar.tsx** doesn't properly handle the case where the user has NO explicit restrictions at a level but also has NO parent filter selected.

## Root Cause

In `FilterBar.tsx` lines 112-124, when computing available options:

```tsx
// For facilities - when no market selected AND no restrictions:
const availableFacilities = hasRestrictionAt('facility')
  ? restrictedOptions.availableFacilities
  : selectedMarket !== "all-markets" 
    ? getFacilitiesByMarket(selectedMarket)
    : restrictedOptions.availableFacilities; // Problem: this might be empty!
```

When `hasRestrictionAt('facility')` is `false` and `selectedMarket === "all-markets"`:
- It falls back to `restrictedOptions.availableFacilities`
- But `restrictedOptions.availableFacilities` comes from `useOrgScopedFilters`
- If there's any issue with the filter data loading, this could be empty

## Solution

### 1. Fix FilterBar Fallback Logic

When user has no restrictions at a level AND no parent filter is selected, use the full data from `useFilterData` instead of relying on `restrictedOptions`:

**Current (lines 106-124):**
```tsx
const availableMarkets = hasRestrictionAt('market')
  ? restrictedOptions.availableMarkets.map(m => ({ id: m, market: m }))
  : getMarketsByRegion(selectedRegion);

const availableFacilities = hasRestrictionAt('facility')
  ? restrictedOptions.availableFacilities
  : selectedMarket !== "all-markets" 
    ? getFacilitiesByMarket(selectedMarket)
    : restrictedOptions.availableFacilities;

const availableDepartments = hasRestrictionAt('department')
  ? restrictedOptions.availableDepartments
  : selectedFacility !== "all-facilities"
    ? getDepartmentsByFacility(selectedFacility)
    : restrictedOptions.availableDepartments;
```

**Fixed:**
```tsx
// Import facilities and departments from useFilterData
const { 
  regions, 
  markets: allMarkets,
  facilities: allFacilities,
  departments: allDepartments,
  getMarketsByRegion, 
  getFacilitiesByMarket, 
  getDepartmentsByFacility,
  ...
} = useFilterData();

// Markets: if restricted, use restricted list; otherwise use full list
const availableMarkets = hasRestrictionAt('market')
  ? restrictedOptions.availableMarkets.map(m => ({ id: m, market: m }))
  : getMarketsByRegion(selectedRegion);

// Facilities: if restricted, use restricted list
// If not restricted and market selected, filter by market
// If not restricted and no market selected, show ALL facilities
const availableFacilities = hasRestrictionAt('facility')
  ? restrictedOptions.availableFacilities
  : selectedMarket !== "all-markets" 
    ? getFacilitiesByMarket(selectedMarket)
    : allFacilities;  // <-- Use full facility list from useFilterData

// Departments: same logic
const availableDepartments = hasRestrictionAt('department')
  ? restrictedOptions.availableDepartments
  : selectedFacility !== "all-facilities"
    ? getDepartmentsByFacility(selectedFacility)
    : allDepartments;  // <-- Use full department list from useFilterData
```

### 2. Update useFilterData to Export Full Lists

Ensure the hook exports the raw `markets`, `facilities`, and `departments` arrays (already does this).

## Files to Modify

| File | Change |
|------|--------|
| `src/components/staffing/FilterBar.tsx` | Fix fallback logic to use full filter data when no restrictions |

## Technical Details

The key insight is that `restrictedOptions` from `useOrgScopedFilters` might still be loading or have stale data. By using the raw data from `useFilterData` directly in the fallback case, we ensure the dropdowns always have options when:
- User has no org access restrictions at that level
- No parent filter is selected

This maintains the restriction logic when it applies, while ensuring unrestricted users always see full options.
