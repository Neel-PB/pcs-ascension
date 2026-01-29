
# Performance Optimization Plan for Positions Module

## Executive Summary

The Positions module experiences noticeable lag due to several performance bottlenecks: excessive hook calls in table cells, unnecessary re-renders from incorrect memoization dependencies, failed API queries, and non-memoized virtualized rows. This plan addresses each issue systematically.

---

## Performance Issues Identified

| # | Issue | Impact | Severity |
|---|-------|--------|----------|
| 1 | `useFilterData` called in every `EditableFTECell` | Hook overhead × 7,000+ cells | High |
| 2 | Wrong dependency in `columnsWithHandlers` useMemo | Columns rebuild unnecessarily | Medium |
| 3 | Comment counts query errors (Bad Request) | Failed requests + console spam | Medium |
| 4 | Non-memoized `TableRow` component | All visible rows re-render on scroll | High |
| 5 | `fetchPriority` prop warning in LogoLoader | Console warnings | Low |
| 6 | Motion animations in frequently-mounted cells | Layout thrashing during scroll | Medium |

---

## Technical Fixes

### Fix 1: Lift `useFilterData` Out of `EditableFTECell`

**Problem**: Each `EditableFTECell` calls `useFilterData()` independently.

**Solution**: Pass filter data as props from the parent component that already has access to it.

**File**: `src/components/editable-table/cells/EditableFTECell.tsx`

```typescript
// BEFORE (line 72):
const { markets, getFacilitiesByMarket, getDepartmentsByFacility } = useFilterData();

// AFTER: Accept as optional props, lazy-load only when popover opens
interface EditableFTECellProps {
  // ... existing props
  filterDataProvider?: {
    markets: Market[];
    getFacilitiesByMarket: (market: string) => Facility[];
    getDepartmentsByFacility: (facilityId: string) => Department[];
  };
}

// Only call useFilterData if provider not passed AND popover is open
const filterData = useMemo(() => {
  if (filterDataProvider) return filterDataProvider;
  // Lazy: only load when needed
  return null;
}, [filterDataProvider]);
```

**File**: `src/pages/positions/EmployeesTab.tsx` and `ContractorsTab.tsx`

```typescript
// Pass shared filter data to cells
const { markets, getFacilitiesByMarket, getDepartmentsByFacility } = useFilterData();
const filterDataProvider = useMemo(() => ({
  markets,
  getFacilitiesByMarket,
  getDepartmentsByFacility,
}), [markets, getFacilitiesByMarket, getDepartmentsByFacility]);

// In columnsWithHandlers, pass to EditableFTECell:
<EditableFTECell
  {...props}
  filterDataProvider={filterDataProvider}
/>
```

---

### Fix 2: Correct `columnsWithHandlers` Dependencies

**Problem**: Dependency array includes `handleRowClick` which isn't used.

**File**: `src/pages/positions/EmployeesTab.tsx` (line 251)

```typescript
// BEFORE:
}, [commentCounts, handleRowClick, handleActualFteUpdate, handleShiftOverrideUpdate]);

// AFTER:
}, [commentCounts, handleCommentClick, handleActualFteUpdate, handleShiftOverrideUpdate]);
```

**File**: `src/pages/positions/ContractorsTab.tsx` (line 245)

```typescript
// Same fix
}, [commentCounts, handleCommentClick, handleActualFteUpdate, handleShiftOverrideUpdate]);
```

---

### Fix 3: Fix Comment Counts Query for Large Position Arrays

**Problem**: When position IDs array is very large (7,000+), the `.in()` query may exceed URL limits.

**File**: `src/hooks/usePositionCommentCounts.ts`

```typescript
// Add batching for large arrays
const { data: counts = new Map<string, number>() } = useQuery({
  queryKey: ['position-comment-counts', positionIdsKey],
  queryFn: async () => {
    if (validPositionIds.length === 0) {
      return new Map<string, number>();
    }

    // Batch queries for large arrays (Supabase URL limit ~8KB)
    const BATCH_SIZE = 500;
    const countMap = new Map<string, number>();
    
    for (let i = 0; i < validPositionIds.length; i += BATCH_SIZE) {
      const batch = validPositionIds.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from('position_comments')
        .select('position_id')
        .in('position_id', batch);

      if (error) {
        console.error('Error fetching comment counts:', error);
        continue;
      }

      if (data) {
        data.forEach((comment) => {
          const currentCount = countMap.get(comment.position_id) || 0;
          countMap.set(comment.position_id, currentCount + 1);
        });
      }
    }

    return countMap;
  },
  enabled: validPositionIds.length > 0,
  staleTime: 30000,
});
```

---

### Fix 4: Memoize `TableRow` Component

**Problem**: Every virtualized row re-renders on scroll, even with unchanged data.

**File**: `src/components/editable-table/TableRow.tsx`

```typescript
import { memo } from 'react';

// Wrap with memo and custom comparison
export const TableRow = memo(function TableRow<T = any>({
  data,
  columns,
  gridTemplate,
  onClick,
  className,
}: TableRowProps<T>) {
  // ... existing implementation
}, (prevProps, nextProps) => {
  // Only re-render if data or columns change
  return (
    prevProps.data === nextProps.data &&
    prevProps.gridTemplate === nextProps.gridTemplate &&
    prevProps.columns === nextProps.columns &&
    prevProps.className === nextProps.className
  );
});
```

---

### Fix 5: Fix `fetchPriority` Warning in LogoLoader

**File**: `src/components/ui/LogoLoader.tsx`

```typescript
// Find and change:
<img fetchPriority="high" ... />

// To:
<img fetchpriority="high" ... />  // lowercase for DOM attribute
```

---

### Fix 6: Reduce Animation Overhead in EditableFTECell

**Problem**: Heavy animations run even when cell isn't open.

**File**: `src/components/editable-table/cells/EditableFTECell.tsx`

```typescript
// Use reduced motion when not in popover view
// Wrap AnimatePresence content with condition to skip animation setup when closed

// Current: All AnimatePresence blocks render even when popover is closed
// Fix: Gate animation components behind popover open state

{open && (
  <AnimatePresence mode="wait">
    {editStatus && (
      <motion.div ...>
        {/* ... */}
      </motion.div>
    )}
  </AnimatePresence>
)}
```

The popover content is already conditionally rendered by Radix, but the motion components still set up listeners. Consider using `layout={false}` on the actions div when not needed.

---

## Summary of Changes

| File | Change | Expected Impact |
|------|--------|-----------------|
| `EditableFTECell.tsx` | Accept filter data as props | 95% reduction in hook overhead |
| `EmployeesTab.tsx` | Fix dependency array, pass filterDataProvider | Fewer re-renders |
| `ContractorsTab.tsx` | Same fixes | Fewer re-renders |
| `usePositionCommentCounts.ts` | Batch large queries | Eliminate Bad Request errors |
| `TableRow.tsx` | Add React.memo with custom comparison | 60-80% fewer row re-renders |
| `LogoLoader.tsx` | Fix prop casing | Eliminate console warning |

---

## Expected Performance Improvements

| Metric | Before | After (Expected) |
|--------|--------|------------------|
| Initial render time | ~2-3s | ~0.5-1s |
| Scroll performance | Janky | Smooth 60fps |
| Hook calls per render | 7,000+ | 1 |
| Console errors | 4+ "Bad Request" | 0 |
| Memory overhead | High | Reduced |

---

## Testing Checklist

1. Load Employees tab with 5,000+ records → verify smooth load
2. Scroll rapidly up/down → verify no jank or lag
3. Open Active FTE popover → verify cascading selects still work
4. Switch between tabs → verify no performance degradation
5. Check console → verify no "Bad Request" or prop warnings
