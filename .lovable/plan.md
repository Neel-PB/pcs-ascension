

## Fix: Hired FTE String Concatenation Bug

### Problem
The API returns `hiredFte` and `activeFte` as strings (e.g., `"0.2"`, `"1"`). The normalizer copies them as-is to `FTE` and `actual_fte`. When the KPI cards sum them with `reduce((sum, c) => sum + (c.FTE || 0), 0)`, JavaScript does string concatenation instead of numeric addition, producing the garbled display you see.

### Solution
Parse both values as numbers in the `normalizeRow` function in `usePositionsByFlag.ts`. This fixes it for all tabs (Employee, Contractor, etc.) at once.

### Change

**File: `src/hooks/usePositionsByFlag.ts`** -- Update two lines in `normalizeRow`:

```typescript
// Before
FTE: row.hiredFte ?? row.FTE,
actual_fte: row.activeFte ?? row.actual_fte,

// After
FTE: parseFloat(row.hiredFte ?? row.FTE) || 0,
actual_fte: parseFloat(row.activeFte ?? row.actual_fte) || 0,
```

This ensures FTE values are always numbers, fixing the KPI cards and any sorting/filtering that relies on numeric comparison.
