

# Fix UI "Scramble" on Positions Page Load

## Problem

When navigating to the Positions module, the UI appears to "scramble" because:

1. **RBAC permissions load asynchronously** - FilterBar conditionally renders filters based on `filterPermissions.region`, `filterPermissions.market`, etc. Until the RBAC hook loads, these may be `false`, causing filters to initially not render, then suddenly appear.

2. **Filter data loads asynchronously** - The `useFilterData()` hook fetches regions, markets, facilities, departments. Until loaded, dropdown options are empty arrays, which may cause visual differences.

3. **Layout shifts** - The conditional rendering `{filterPermissions.region && <Select>...}` causes elements to appear/disappear as permissions load.

## Solution

Make filters render immediately with a consistent layout, regardless of loading state:

1. **Always render filter containers** - Use opacity/disabled states instead of conditional rendering
2. **Default to showing all filters during loading** - Prevents layout shift
3. **Show skeleton/disabled state while RBAC loads** - Maintains consistent UI

## Changes

### File: `src/components/staffing/FilterBar.tsx`

**Change 1: Destructure loading state from hooks**

```typescript
const { 
  regions, 
  markets,
  // ...
  isLoading: filterDataLoading 
} = useFilterData();

const { getFilterPermissions, getSubfilterPermissions, loading: rbacLoading } = useRBAC();
```

**Change 2: Determine if still loading**

```typescript
const isLoading = rbacLoading || filterDataLoading;
```

**Change 3: Default permissions during loading**

To prevent layout shifts, default to showing all filters during loading:

```typescript
// During loading, show all filters to prevent layout shift
// Once loaded, respect actual permissions
const filterPermissions = rbacLoading 
  ? { region: true, market: true, facility: true, department: true }
  : getFilterPermissions();

const subfilterPermissions = rbacLoading
  ? { submarket: true, level2: true, pstat: true }
  : getSubfilterPermissions();
```

**Change 4: Disable filters while loading**

Add disabled state to all Select components when loading:

```tsx
<Select 
  value={selectedRegion} 
  onValueChange={onRegionChange}
  disabled={isLoading}  // Add this
>
```

This ensures:
- Filters always render in their expected positions (no layout shift)
- Filters are disabled (grayed out) until data loads
- Once loaded, filters respect actual RBAC permissions
- If a user doesn't have permission for a filter, it gracefully hides after load (minimal visual impact since page is already stable)

### Alternative Approach (Simpler)

If we want to completely hide the loading complexity:

**Option B: Don't conditionally render filters at all during load**

Keep filters visible but disabled until fully loaded:

```tsx
// Always render all main filters
<Select 
  value={selectedRegion} 
  onValueChange={onRegionChange}
  disabled={isLoading || !filterPermissions.region}
>
```

This is simpler but means users without permission briefly see disabled filters before they hide.

## Recommended Approach

I recommend **Change 3 + Change 4** (default permissions during loading, then respect actual permissions). This:

- Prevents any layout shift on initial load
- Shows all filters immediately in a disabled state
- Once RBAC loads, filters that user doesn't have permission for will hide
- The hide happens after page is stable, so it's less jarring

## Files to Modify

| File | Change |
|------|--------|
| `src/components/staffing/FilterBar.tsx` | Add loading state handling, default permissions during load |

## Visual Result

| Stage | Before | After |
|-------|--------|-------|
| Initial render | Filters missing, then pop in | All filters visible (disabled) |
| RBAC loaded | Filters appear causing shift | Filters enable, unpermitted ones hide |
| Filter data loaded | Options appear in dropdowns | Options appear in dropdowns |

