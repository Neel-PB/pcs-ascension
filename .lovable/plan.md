

## Fix: Cascading Filtering in Access Scope Dialogs

### Problem
When selecting Region 1, the Market dialog still shows markets from all regions instead of only markets belonging to Region 1. The cascading filter logic exists in code but may not be triggering properly, and child selections aren't cleaned up when parent selections change.

### Changes

**`src/components/admin/AccessScopeManager.tsx`**

1. **Fix `handleLevelDone`** — when a parent level changes, automatically clear stale child selections that no longer belong to the new parent scope:
   - Changing **regions** → prune markets, facilities, departments that don't belong to the new region set
   - Changing **markets** → prune facilities and departments
   - Changing **facilities** → prune departments

2. **Ensure `levelItems` memo recomputes correctly** — verify the dependency on `selectedAccess` triggers properly by destructuring the Sets' sizes as additional deps (as a safety measure against stale closures)

3. **Add cascading cleanup function**:
```
handleLevelDone("regions", newRegions):
  - keep only markets whose region is in newRegions (or keep all if newRegions is empty)
  - keep only facilities whose region/market is still valid
  - keep only departments whose facility is still valid
```

This ensures the data shown in each dialog always reflects the parent selections, and no orphaned child selections persist.

