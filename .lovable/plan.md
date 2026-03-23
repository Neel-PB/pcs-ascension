

## Send Restricted Filter Values to API When "All X" Is Selected

### Problem
When a user has access to 1 region and 2 markets, the filter store holds:
- `selectedRegion = "Region 1"` (pre-selected, sent to API)
- `selectedMarket = "all-markets"` (2 options available, shows "All Markets")

The `clean()` function in data hooks strips `"all-markets"` to `null`, so the API receives no market filter. The API returns data for ALL markets system-wide instead of just the 2 restricted markets.

This applies to every level: if a user has restrictions at market, facility, or department level but multiple options exist, selecting "All X" sends no filter to the API.

### Solution
Create a helper hook or utility that resolves the "effective" filter values. When a user selects "All Markets" but has 2 restricted markets, the effective value should send those 2 markets to the API. The data-fetching hooks need to use these effective values.

### Changes

#### 1. `src/hooks/useOrgScopedFilters.ts`
Add a new return field `effectiveApiFilters` that resolves what should actually be sent to APIs:

```typescript
effectiveApiFilters: {
  regions: string[] | null;    // null = no restriction, send nothing
  markets: string[] | null;
  facilities: string[] | null;
  departments: string[] | null;
}
```

Logic: If filter is "all-X" AND user has restrictions at that level, return the restricted list. Otherwise return null (unrestricted).

#### 2. `src/hooks/useSkillShift.ts`, `usePatientVolume.ts`, `useProductiveResourcesKpi.ts`, `useEmploymentSplit.ts`, `usePositionsByFlag.ts`
Update these hooks to accept an optional array of values for each filter level. When the array has items, join them as comma-separated params (or make multiple param appends) so the API filters correctly.

Alternatively — simpler approach:

#### Alternative: Resolve at the FilterBar/Store level
Instead of changing every hook, intercept in the filter store or StaffingSummary. When `selectedRegion = "Region 1"` and `selectedMarket = "all-markets"`, but user has only 2 markets, pass the region filter to the API. Since the API already supports region-level filtering, the server returns only data within that region (which contains only those 2 markets).

**Wait — this already works.** If `selectedRegion = "Region 1"`, the API receives `region=Region 1` and returns only data within that region. The 2 markets are within that region, so the data is already correctly scoped.

The real question is: **does the API support multi-value filters?** If not, and the user has 2 markets across 2 regions with no region restriction, we need a different approach.

#### Recommended approach: Pass region as the primary scope filter

For the user's scenario (1 region, 2 markets within it), the current system already sends `region=Region 1` to the API. The market filter showing "All Markets" is fine because it means "all markets within Region 1" — the API is already scoped by region.

**However**, there's a gap when restrictions exist at a level but no parent restriction exists. For example: user has access to 2 specific markets (no region restriction). Then `selectedRegion = "all-regions"` and `selectedMarket = "all-markets"` sends nothing to the API.

#### Fix: `initializeFromDefaults` should also set region default

Currently `initializeFromDefaults` only sets `selectedRegion` if the default isn't "all-regions". But for 1 region + 2 markets, `defaultRegion = "Region 1"` — this IS set. So the API should receive `region=Region 1`.

Let me verify: does the current `initializeFromDefaults` actually apply `defaults.region`?

Looking at lines 87-112 of `useFilterStore.ts`: it sets `selectedRegion` only if `!filterPerms.region` (region filter hidden) AND `defaults.region !== "all-regions"`. But it does NOT set region when the filter IS visible.

**That's the bug.** The store initializes `selectedRegion` to `"all-regions"` by default (line 44), and `initializeFromDefaults` only overrides it for hidden filters, not visible ones. The region default of `"Region 1"` never gets applied to the store.

#### Fix in `src/stores/useFilterStore.ts`
Lines 87-112: Add region to the visible-filter defaults section:

```typescript
// Apply defaults for visible filters with restrictions  
if (defaults.region !== ALL_REGIONS) {
  updates.selectedRegion = defaults.region;
}
if (defaults.market !== ALL_MARKETS) {
  updates.selectedMarket = defaults.market;
}
```

This ensures that when access scope resolves a single region as the default, it gets applied to the store even when the region filter is visible — which means the API receives `region=Region 1`.

### Files Changed
- `src/stores/useFilterStore.ts`

