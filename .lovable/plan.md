

## Audit: Global Filter Hierarchy Cascading

### Current Status

| Parent → Child | Dropdown Options Cascade? | Store Resets on Change? |
|---|---|---|
| Region → Market | Yes | Yes |
| Region → Facility | Yes | Yes |
| Market → Facility | Yes | Yes |
| Facility → Department | Yes | Yes |
| Market → Submarket | Yes | Yes (market reset clears submarket) |
| Region → Submarket | No options shown (correct — submarket is market-scoped) | Yes |
| Facility → Level 2 | Yes | Yes |
| Facility → PSTAT | Yes | Yes |
| **Region → Level 2** | **No** — shows ALL values | Yes (store resets) |
| **Market → Level 2** | **No** — shows ALL values | Yes (store resets) |
| **Region → PSTAT** | **No** — shows ALL values | Yes (store resets) |
| **Market → PSTAT** | **No** — shows ALL values | Yes (store resets) |
| **Submarket → Facility** | **No** — submarket selection doesn't filter facilities | No reset in store |

### Gaps Found

1. **Level 2 and PSTAT** options don't cascade from Region or Market. When facility is "all-facilities", `getLevel2Options` and `getPstatOptions` return every value in the dataset regardless of the selected region/market.

2. **Submarket → Facility** cascading is missing. Selecting a submarket doesn't narrow the facility list. This is a nice-to-have since submarket is an optional filter.

### Proposed Fix

**File 1: `src/hooks/useFilterData.ts`**
- Expand `getLevel2Options` and `getPstatOptions` to accept `region` and `market` parameters. When facility is "all-facilities", filter values by facilities matching the selected market or region.

**File 2: `src/components/staffing/FilterBar.tsx`**
- Pass `selectedRegion` and `selectedMarket` to the updated `getLevel2Options` and `getPstatOptions` calls.
- Optionally: filter `availableFacilities` by `selectedSubmarket` when a submarket is active.

**File 3: `src/stores/useFilterStore.ts`**
- No changes needed — reset logic already clears child filters correctly.

### Scope
- 2 files changed
- Level 2 and PSTAT options will properly narrow when a Region or Market is selected

