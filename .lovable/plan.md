

## Fix: Variance Analysis showing zeros because API returns string FTE values

### Root Cause

The `/skill-shift` API returns all FTE fields as **strings** (e.g., `"hired_day_fte":"1.00"`), but `aggregateRecordsToVariance` performs arithmetic on them directly. JavaScript string subtraction yields `NaN`, so every cell becomes `0.0` due to the `NaN` guard in `formatVariance`.

The Staffing Summary / Position Planning tabs work because they use `reduce` with explicit number coercion or different aggregation logic.

### Fix

In `src/pages/staffing/VarianceAnalysis.tsx`, wrap each field access with `parseFloat()` (or `Number()`) in the `aggregateRecordsToVariance` function (lines 84-86):

```typescript
const dayVar = Number(r.hired_day_fte) - Number(r.target_fte_day) + Number(r.open_reqs_day_fte);
const nightVar = Number(r.hired_night_fte) - Number(r.target_fte_night) + Number(r.open_reqs_night_fte);
const totalVar = Number(r.hired_total_fte) - Number(r.target_fte_total) + Number(r.open_reqs_total_fte);
```

### Scope
- **1 file**: `src/pages/staffing/VarianceAnalysis.tsx`
- **3 lines** changed (84-86)

