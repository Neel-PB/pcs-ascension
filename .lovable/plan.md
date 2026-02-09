

# Fix Comment Counts Not Displaying in Employees Table

## Problem

The comment counts column shows "-" for all rows instead of actual counts. After investigation, the issue is with how the `commentCounts` Map is handled in React's memoization:

1. **Unstable default value**: Line 32 of `usePositionCommentCounts.ts` creates a new `Map` instance on every render when data is undefined
2. **Closure capture**: The `createEmployeeColumnsWithComments` function captures the `commentCounts` Map at column creation time, but the Map might be empty initially

---

## Root Cause Analysis

The data flow:
1. `employees` query loads position data
2. `positionIds` are extracted from `filteredAndSortedEmployees`
3. `commentCounts` query fetches counts for those IDs
4. `columnsWithHandlers` memoizes columns with `commentCounts`

The problem: When `columnsWithHandlers` is first computed, `commentCounts` is an empty Map. When the counts query completes, a new Map is returned, but the column's `renderCell` closure may still reference the old empty Map.

---

## Solution

### 1. Stabilize the default Map in `usePositionCommentCounts.ts`

Create a stable empty Map reference outside the hook to prevent referential instability:

```typescript
// Add at top of file, outside the hook
const EMPTY_MAP = new Map<string, number>();

export function usePositionCommentCounts(positionIds: string[]) {
  // ... existing code ...
  
  const { data: counts = EMPTY_MAP } = useQuery({
    // ... existing config ...
  });
  
  return counts;
}
```

### 2. (Optional) Add isLoading state handling

Return loading state so the UI can show a loading indicator:

```typescript
const { data: counts = EMPTY_MAP, isLoading } = useQuery({...});
return { counts, isLoading };
```

Then in EmployeesTab, you could show a loading spinner in the counts cell while loading.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/usePositionCommentCounts.ts` | Create stable `EMPTY_MAP` constant outside the hook and use it as the default value |

---

## Technical Notes

- The `EMPTY_MAP` constant ensures React's memoization detects when the actual data Map is returned vs the empty default
- This is a common pattern for React Query hooks that return collection types
- No changes needed to `EmployeesTab.tsx` since the `useMemo` dependencies are already correct

