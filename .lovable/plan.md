

# Performance Optimization Analysis and Recommendations

## Current State Summary

Your application already implements several best practices for performance. Based on my thorough analysis of the codebase, I identified the following areas where additional optimizations could further improve the user experience.

---

## Priority 1: High Impact Optimizations

### 1.1 Virtualized Table Rendering

**Problem**: The `EditableTable` component renders all rows at once, which becomes slow with large datasets (7,000+ positions in the database).

**Current State** (EditableTable.tsx lines 238-250):
```tsx
{data.map((row) => {
  const rowId = getRowId(row);
  return (
    <TableRow key={rowId} ... />
  );
})}
```

**Solution**: Implement virtualized rendering using `@tanstack/react-virtual` or a similar library. This renders only visible rows, reducing DOM nodes from thousands to ~20-30.

**Expected Impact**: 
- Render time reduced from ~500ms to ~20ms for large tables
- Memory usage reduced by 80%+
- Smoother scrolling

---

### 1.2 Comment Count Query Optimization

**Problem**: `usePositionCommentCounts` fetches ALL comments and filters client-side (line 33-50).

**Current State**:
```tsx
const { data, error } = await supabase
  .from('position_comments')
  .select('position_id');
// Then filters client-side
```

**Solution**: Use a server-side aggregation query or database function:
```sql
SELECT position_id, COUNT(*) as count 
FROM position_comments 
WHERE position_id = ANY($1)
GROUP BY position_id
```

**Expected Impact**:
- Network payload reduced by 90%
- Query time reduced from ~200ms to ~20ms

---

### 1.3 Filter Data Parallel Fetching

**Problem**: `useFilterData` hook fetches regions, markets, facilities, and departments as separate queries that could be parallelized more efficiently.

**Solution**: Use `useQueries` from React Query or a single RPC call to fetch all filter data at once:
```tsx
const { data: filterData } = useQuery({
  queryKey: ['all-filter-data'],
  queryFn: async () => {
    const [regions, markets, facilities, departments] = await Promise.all([
      supabase.from('regions').select('*'),
      supabase.from('markets').select('*'),
      supabase.from('facilities').select('*'),
      supabase.from('departments').select('*'),
    ]);
    return { regions, markets, facilities, departments };
  },
  staleTime: 10 * 60 * 1000, // 10 minutes - static data
});
```

**Expected Impact**:
- Single cache key instead of 4
- Reduced React Query overhead
- Atomic loading state

---

## Priority 2: Medium Impact Optimizations

### 2.1 Memoize Heavy Component Props

**Problem**: Several components recreate objects/functions on every render, causing unnecessary child re-renders.

**Examples**:

In `EmployeesTab.tsx` line 211-240, `columnsWithHandlers` is recalculated but its dependencies include `handleRowClick` which isn't wrapped in `useCallback`:
```tsx
const handleRowClick = (employee: any) => { // Not memoized
  setSelectedEmployee(employee);
  ...
};
```

**Solution**: Ensure all event handlers passed to memoized components are wrapped in `useCallback`.

---

### 2.2 Debounce Search Input

**Problem**: In `EmployeesTab.tsx` line 253, search input triggers filtering on every keystroke:
```tsx
onChange={(e) => setSearchQuery(e.target.value)}
```

**Solution**: Add debounce (300ms) to prevent excessive filtering during typing:
```tsx
const debouncedSetSearch = useMemo(
  () => debounce(setSearchQuery, 300),
  []
);
```

---

### 2.3 Lazy Load Heavy Drawer/Sheet Components

**Problem**: `WorkforceDrawer`, `EmployeeDetailsSheet`, `FeedbackPanel` are included in the component tree even when not visible.

**Solution**: Use React.lazy() with Suspense for these components:
```tsx
const EmployeeDetailsSheet = lazy(() => 
  import('@/components/workforce/EmployeeDetailsSheet')
);
```

---

## Priority 3: Lower Impact / Maintenance Optimizations

### 3.1 IndexedDB for Large Data Caching

**Problem**: React Query stores cache in memory, which is lost on page refresh.

**Solution**: Use `@tanstack/query-sync-storage-persister` with IndexedDB for positions data to enable instant loading on return visits.

---

### 3.2 Reduce Bundle Size

**Analysis** of current chunks from `vite.config.ts`:
- `vendor-charts` (recharts) - Only needed on Analytics page
- `vendor-excel` (xlsx) - Only needed for data import
- `vendor-docparse` (mammoth) - Only needed for document parsing

These are already chunked correctly for dynamic import.

**Additional Opportunity**: Consider replacing `framer-motion` (large library) with CSS animations or `@formkit/auto-animate` for simpler animations where full Framer isn't needed.

---

### 3.3 Database Query Optimization

**Observation**: The `positions` table is 4.5MB with 7,007 records.

**Recommendations**:
1. Add database indexes on frequently filtered columns (market, facilityId, departmentId)
2. Consider pagination or cursor-based loading for very large result sets
3. Add a covering index for common query patterns

---

## Implementation Summary

| Optimization | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| Virtualized table rendering | High | Medium | 1 |
| Comment count query optimization | Medium | Low | 1 |
| Filter data parallel fetch | Medium | Low | 1 |
| Memoize handlers | Medium | Low | 2 |
| Debounce search | Medium | Low | 2 |
| Lazy load sheets/drawers | Medium | Low | 2 |
| IndexedDB caching | Medium | High | 3 |
| Framer Motion alternatives | Low | High | 3 |
| Database indexes | Medium | Low | 3 |

---

## Technical Architecture Diagram

```text
Current Data Flow:
  ┌─────────────────────────────────────────────────────────────┐
  │ User Request                                                 │
  │    ↓                                                         │
  │ useEmployees() → Supabase Query (all 7000+ rows)            │
  │    ↓                                                         │
  │ Client-side filtering/sorting (useMemo)                      │
  │    ↓                                                         │
  │ EditableTable → Renders ALL rows as DOM                      │
  │    ↓                                                         │
  │ 7000+ TableRow components in memory                          │
  └─────────────────────────────────────────────────────────────┘

Optimized Data Flow:
  ┌─────────────────────────────────────────────────────────────┐
  │ User Request                                                 │
  │    ↓                                                         │
  │ useEmployees() → Supabase Query with limit/pagination        │
  │    ↓                                                         │
  │ Virtualized Table → Renders only ~20-30 visible rows         │
  │    ↓                                                         │
  │ On scroll → Load more rows (windowing)                       │
  └─────────────────────────────────────────────────────────────┘
```

---

## Recommended Next Steps

1. **Quick Wins** (1-2 hours): Implement debounced search, memoize handlers
2. **High Value** (1 day): Add table virtualization with `@tanstack/react-virtual`
3. **Backend** (30 mins): Optimize comment count query with server-side aggregation

