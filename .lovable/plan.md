

## Fix "No refresh data available" — Use `pos_status_date` as timestamp

### Change

**File: `src/hooks/usePositionsByFlag.ts`** — line 40 in `normalizeRow`

Update the `curated_data_load_ts` mapping to include `pos_status_date`:

```tsx
// Current:
curated_data_load_ts: row.curated_data_load_ts ?? row.curatedDataLoadTs ?? row.load_ts ?? row.loadTs ?? row.updated_at ?? row.updatedAt,

// New:
curated_data_load_ts: row.curated_data_load_ts ?? row.curatedDataLoadTs ?? row.load_ts ?? row.loadTs ?? row.updated_at ?? row.updatedAt ?? row.pos_status_date ?? row.posStatusDate ?? row.positionStatusDate,
```

### Files Modified
1. `src/hooks/usePositionsByFlag.ts` — line 40: add `pos_status_date` fallback

