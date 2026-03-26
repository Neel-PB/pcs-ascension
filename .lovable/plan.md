

## Fix NaN Values — API Returns Strings Instead of Numbers

### Problem
The API returns numeric fields as **strings** (e.g., `"1.00"` instead of `1.00`). The aggregation code does `g.hiredFte += row.hired_fte || 0` which concatenates strings instead of adding numbers, producing `NaN` downstream.

### Fix

**File: `src/hooks/useForecastBalance.ts`** (lines 168-174)

Wrap each numeric field with `parseFloat()` during aggregation:

```typescript
g.hiredFte += parseFloat(String(row.hired_fte)) || 0;
g.openReqsFte += parseFloat(String(row.open_reqs_fte)) || 0;
g.targetFte += parseFloat(String(row.target_fte)) || 0;
g.totalFteReq += parseFloat(String(row.total_fte_req)) || 0;
g.addressedFte += parseFloat(String(row.addressed_fte)) || 0;
g.unaddressedFte += parseFloat(String(row.unaddressed_fte)) || 0;
```

Also update the `ForecastApiRow` interface types from `number` to `number | string` for these fields to reflect reality, or just rely on the parseFloat coercion.

This single change fixes:
- NaN in FTE Gap column
- NaN in KPI cards (FTE Shortage / FTE Surplus)
- NaN in expanded detail panels

