

## Cascade Filter Options Based on Access Scope Hierarchy

### Problem
When a user has access to only 1 region (but no explicit market/facility/department restrictions), the Market, Facility, and Department dropdowns still show ALL options from the entire system. They should be cascaded — only showing markets within the restricted region, facilities within those markets, and departments within those facilities.

### Root Cause
In `useOrgScopedFilters.ts`, each filter level is independently checked:
- `availableMarkets` only filters if `hasMarketRestriction` is true
- `availableFacilities` only filters if `hasFacilityRestriction` is true

There's no cascading from parent restrictions to child levels.

### Changes

**`src/hooks/useOrgScopedFilters.ts`** — Lines 94-119

Update the `availableMarkets` and `availableFacilities` computation to cascade from parent restrictions:

**Markets (lines 98-101):** If user has market restriction, use those. Otherwise, if user has region restriction, filter markets to only those within the restricted regions. Otherwise show all.

```typescript
const availableMarkets = accessScope.hasMarketRestriction
  ? accessScope.markets
  : accessScope.hasRegionRestriction
    ? markets.filter(m => m.region && accessScope.regions.some(r => 
        r.toLowerCase() === m.region?.toLowerCase()
      )).map(m => m.market)
    : markets.map(m => m.market);
```

**Facilities (lines 105-119):** If user has facility restriction, use those. Otherwise, cascade from market restrictions (which already cascade from region). Otherwise show all.

```typescript
const availableFacilities = accessScope.hasFacilityRestriction
  ? (facilities.length > 0 
      ? facilities.filter(f => accessScope.facilities.some(of => of.facilityId === f.facility_id))
      : accessScope.facilities.map(f => ({ ... }))
    )
  : accessScope.hasMarketRestriction
    ? facilities.filter(f => accessScope.markets.some(m => m.toLowerCase() === f.market?.toLowerCase()))
    : accessScope.hasRegionRestriction
      ? facilities.filter(f => f.region && accessScope.regions.some(r => r.toLowerCase() === f.region?.toLowerCase()))
      : facilities;
```

The department cascading (lines 123-174) already handles this correctly via the priority chain.

### Result
- User with 1 region: sees only that region's markets, facilities, and departments
- User with region + market restrictions: markets filtered by access scope, facilities/departments cascade from markets
- No restrictions: all options shown as before

### Files Changed
- `src/hooks/useOrgScopedFilters.ts`

