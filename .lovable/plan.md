

## Fix HeadcountBreakdown: Group by Employee Type + FTE Value

### Problem
Aggregation groups by `employee_type` only. When entries of the same type have different `fte_value`s (e.g., 128 FT at 1.0 + 1 FT at 0.8), the display shows `Full Time: 1 FTE × 129 = 128.8 FTE` — mathematically incorrect.

### Fix

**File: `src/components/forecast/BalanceTwoPanel.tsx`** — `HeadcountBreakdown` (lines 102-113)

Change the aggregation key from `employee_type` alone to `employee_type + fte_value`. This way each unique FTE value gets its own row with a correct formula:

```
Full Time: 1.0 FTE × 128 = 128.0 FTE
Full Time: 0.8 FTE × 1   = 0.8 FTE
```

```typescript
const key = `${type}_${fteVal}`;
const existing = aggregated.get(key);
if (existing) {
  existing.totalHc += hc;
  existing.totalFte += fteVal * hc;
} else {
  aggregated.set(key, { type, fteVal, totalHc: hc, totalFte: fteVal * hc });
}
```

Update the render to read `type` from the value object and use `employeeTypeLabels` for the label.

### Files Modified
1. `src/components/forecast/BalanceTwoPanel.tsx` — group by type+fteVal for correct math

