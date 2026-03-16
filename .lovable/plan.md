

## Fix: Add Region/Market-Based Cascading for Facilities and Departments

### Problem
1. **Facilities**: When a region is selected but market is "All Markets", `getAvailableFacilities()` falls through to `return allFacilities` — showing every facility instead of only those in the selected region.
2. **Departments**: Disabled when facility is "all-facilities", even if a region or market is selected. Should cascade from the selected market/region.

### Changes — `src/components/staffing/FilterBar.tsx`

**1. Facility cascading from region** (~line 123, before `return allFacilities`):
Add a region check after the market-restriction block:
```typescript
// NEW: Region selected → filter by region
if (selectedRegion !== "all-regions") {
  return allFacilities.filter(f =>
    f.region?.toLowerCase() === selectedRegion.toLowerCase()
  );
}
return allFacilities;
```

**2. Department cascading from market/region** (~line 147, after facility cascade and before restriction checks):
Insert two new blocks after `if (selectedFacility !== "all-facilities")`:
```typescript
// NEW: Market selected → departments from facilities in that market
if (selectedMarket !== "all-markets") {
  const marketFacilityIds = new Set(
    allFacilities.filter(f => f.market.toLowerCase() === selectedMarket.toLowerCase()).map(f => f.facility_id)
  );
  // dedupe by department_name, return sorted
}

// NEW: Region selected → departments from facilities in that region  
if (selectedRegion !== "all-regions") {
  const regionFacilityIds = new Set(
    allFacilities.filter(f => f.region?.toLowerCase() === selectedRegion.toLowerCase()).map(f => f.facility_id)
  );
  // dedupe by department_name, return sorted
}
```

**3. Enable department dropdown when region or market is selected** (line 245-246):
```typescript
const isDepartmentDisabled = lockedFilters.department || 
  (!hasRestrictionAt('department') && selectedFacility === "all-facilities" 
    && selectedMarket === "all-markets" && selectedRegion === "all-regions");
```

### Scope
- **1 file**: `src/components/staffing/FilterBar.tsx`
- 3 insertion points, no breaking changes

