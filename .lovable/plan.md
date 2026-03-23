

## Use `patient_volume_low_high` from `last_12_month_volume_stats` for 3M Low & 3M High Charts

### Problem
Currently, the 3M Low and 3M High KPI cards use `dailyTrend` (which is built from `patient_volume_dly`) for their chart data. The API returns a separate field `patient_volume_low_high` in each `last_12_month_volume_stats` array entry that should be used specifically for these two charts.

### Changes

#### 1. `src/hooks/usePatientVolume.ts` — Add `patient_volume_low_high` to type
Update the `last_12_month_volume_stats` array type to include the new field:
```typescript
last_12_month_volume_stats: Array<{
  year_month: string;
  patient_volume_dly: number;
  patient_volume_mthly: number;
  patient_volume_low_high: number;
}> | string | null;
```

#### 2. `src/pages/staffing/StaffingSummary.tsx` — Extract low_high trend
In the `useMemo` that aggregates `last_12_month_volume_stats` (~line 442), add a third aggregation for `lowHigh`:
- Accumulate `patient_volume_low_high` per `year_month` alongside `mthly` and `dly`
- Return a new `lowHighTrend` array: `sorted.map(([, v]) => ({ value: v.lowHigh }))`

Then update the chart data for 3M Low and 3M High KPIs (~lines 650, 666):
- **3M Low**: `chartData: lowHighTrend.length > 0 ? lowHighTrend : ...`
- **3M High**: `chartData: lowHighTrend.length > 0 ? lowHighTrend : ...`

The 12M Average, 12M Daily Average, and Target Vol charts remain unchanged (using `monthlyTrend` and `dailyTrend`).

