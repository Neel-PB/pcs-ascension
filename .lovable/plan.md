

## Fix: Show full decimal precision for Volume KPI values

### Problem
The `fmt` function in `StaffingSummary.tsx` (line 285) uses `maximumFractionDigits: 1`, which rounds `179.97` to `180`. The API returns values with up to 2 decimal places that should be preserved.

### Fix
In `src/pages/staffing/StaffingSummary.tsx` line 285-286, change `maximumFractionDigits` from `1` to `2`:

```typescript
const fmt = (v: number | null | undefined) =>
  v != null ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—";
```

This will display `179.97` instead of `180` for daily averages, while monthly totals like `5,474` remain unaffected since they have no decimals.

### Scope
Single line change in `StaffingSummary.tsx`.

