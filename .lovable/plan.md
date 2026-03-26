

## Fix DataRefreshButton Timestamp in Positions Module

### Problem
The `DataRefreshButton` in all Position tabs tries to read `curated_data_load_ts` or `updated_at` from the first row of data. However, the NestJS API returns the timestamp as `load_ts`, and the `normalizeRow` function in `usePositionsByFlag.ts` doesn't map this field. Result: the button always shows "No refresh data available."

### Fix

**File: `src/hooks/usePositionsByFlag.ts`** (normalizeRow, ~line 12-40)

Add the timestamp mapping to `normalizeRow`:

```typescript
curated_data_load_ts: row.load_ts ?? row.curated_data_load_ts ?? row.updated_at,
```

This single line ensures all 5 Position tabs (Employee, Open Requisition, Open Position, Contractor, Contractor Requisition) pick up the correct timestamp since they all read `[0]?.curated_data_load_ts`.

### Files Modified
1. `src/hooks/usePositionsByFlag.ts` — add `curated_data_load_ts` mapping from `load_ts`

