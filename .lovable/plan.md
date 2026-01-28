
# Optimize FilterBar Loading: Static UI with Inline Loaders

## Problem

Currently, the FilterBar:
1. **Disables ALL dropdowns** while waiting for ANY data to load (RBAC, filter data, org scopes)
2. **No visual feedback** - dropdowns just appear disabled/frozen, looking like "animations not working"
3. **Combined loading state** blocks all interaction until everything loads

This creates a poor UX where static UI elements (labels, dropdowns) wait unnecessarily for API data.

## Solution

Render the static UI immediately and show inline loading indicators only where data is loading:

1. **Never disable dropdowns due to loading** - they're always interactive
2. **Inside dropdown content**: Show skeleton/loading state while options are loading
3. **Static elements (Level 2, PSTAT)**: Always available immediately (hardcoded options)
4. **API-dependent dropdowns (Region, Market, Facility, Department)**: Show "Loading..." item when data not ready

## Changes Required

### FilterBar.tsx

**Remove blocking `isLoading` from disabled prop:**

```tsx
// BEFORE (blocks interaction)
<Select disabled={isLoading || isRegionDisabled}>

// AFTER (only lock-based disabling)
<Select disabled={isRegionDisabled}>
```

**Add inline loading state inside SelectContent:**

```tsx
<SelectContent>
  {filterDataLoading ? (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
    </div>
  ) : (
    <>
      {shouldShowAllOption('region') && (
        <SelectItem value="all-regions">All Regions</SelectItem>
      )}
      {regions.map(region => (
        <SelectItem key={region} value={region}>{region}</SelectItem>
      ))}
    </>
  )}
</SelectContent>
```

### Loading State Strategy

| Filter | Data Source | Loading Behavior |
|--------|-------------|------------------|
| Region | API (regions table) | Show loader inside dropdown |
| Market | API (markets table) | Show loader inside dropdown |
| Facility | API (facilities table) | Show loader inside dropdown |
| Department | API (departments table) | Show loader inside dropdown |
| Submarket | Derived from facilities | Depends on facility load |
| Level 2 | Static array | Instant - no loading |
| PSTAT | Static array | Instant - no loading |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/staffing/FilterBar.tsx` | Remove `isLoading` from disabled props, add inline loaders in SelectContent |

## Benefits

1. **Instant UI** - Filter bar renders immediately, no waiting
2. **Clear feedback** - Users see exactly which data is loading
3. **Progressive loading** - Static filters work immediately (Level 2, PSTAT)
4. **Non-blocking** - Can interact with dropdowns even while loading (shows loader inside)

## Technical Details

### Dropdown Loading States

Each dropdown independently shows its loading state:

```tsx
// Region dropdown content
<SelectContent>
  {regionsLoading ? (
    <div className="py-3 px-2 flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="text-sm">Loading regions...</span>
    </div>
  ) : (
    <>
      <SelectItem value="all-regions">All Regions</SelectItem>
      {regions.map(r => (
        <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>
      ))}
    </>
  )}
</SelectContent>
```

### Hook Changes

Expose individual loading states from `useFilterData`:

```tsx
return {
  regions,
  markets,
  facilities,
  departments,
  regionsLoading,
  marketsLoading,
  facilitiesLoading,
  departmentsLoading,
  isLoading: regionsLoading || marketsLoading || facilitiesLoading || departmentsLoading,
  // ... helpers
};
```

This allows FilterBar to show targeted loaders per dropdown rather than a global blocking state.
