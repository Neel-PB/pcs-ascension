

## Fix Staff Type Column Showing Wrong Values

### Problem

The database column is `employment_type` with values "Full-Time", "Part-Time", "PRN". But the UI shows "Regular" for all rows.

**Root cause** in `src/hooks/usePositionsByFlag.ts` line 20:

```typescript
employmentType: row.employeeType ?? row.employmentType,
```

The API returns the field as `employment_type` (snake_case). The normalizer checks `employeeType` first -- which likely exists in the API response with values like "Regular" -- and never reaches `employment_type`. The correct DB values ("Full-Time", "Part-Time", "PRN") are ignored.

### Fix

Update the normalization in `src/hooks/usePositionsByFlag.ts` to prioritize `employment_type` (the actual DB column name):

```typescript
employmentType: row.employment_type ?? row.employeeType ?? row.employmentType,
```

This single-line change ensures the snake_case field from the API/DB is checked first, so "Full-Time", "Part-Time", and "PRN" display correctly in the Staff Type column across all tabs.

### Files Modified

- `src/hooks/usePositionsByFlag.ts` -- one line change in `normalizeRow`

