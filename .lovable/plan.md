

## Use real patient-volume data for Volume KPI charts

### Problem
Volume KPI cards (12M Average, 12M Daily Average, 3M Low, 3M High, Target Vol) currently show randomly generated chart data (`generateGrowthTrend`, `generateVolatileTrend`, etc.) instead of real data.

### Approach
The patient-volume API returns one record per department (with pre-computed aggregates), not monthly time-series. The chart format is `Array<{ value: number }>`. We will populate charts with **per-department breakdown bars** — each bar represents one department's contribution to the summed KPI value. This gives a meaningful view of which departments drive the total.

For Override Vol, it remains as-is (single value, no breakdown source).

### Changes: `src/pages/staffing/StaffingSummary.tsx`

1. **Build chart data arrays from `patientVolumeData`** inside the `volumeKPIs` useMemo, using the same filtered records that feed `pvAgg`:
   - For each volume metric (e.g. `mthly_avg_volume_12mth`), map the filtered records to `{ value: Number(record[field]) }`, sorted descending by value
   - Generate corresponding `xAxisLabels` from department names (truncated for readability)

2. **Replace random generators** in chart data for each volume KPI:
   - `12m-monthly`: `records.map(r => ({ value: Number(r.mthly_avg_volume_12mth) }))` 
   - `12m-daily`: uses `dly_avg_volume_12mth`
   - `3m-low`: uses `dly_avg_volume_3mth_low`
   - `3m-high`: uses `dly_avg_volume_3mth_high`
   - `target-vol`: uses `target_volume`

3. **Switch chart type to `bar`** for all volume KPIs (department breakdown is better visualized as bars)

4. **Extract department labels** from the same filtered records, using `department_description` (falling back to cleaned `concat_dept_name`)

### Scope
Single file changed: `StaffingSummary.tsx`. ~30 lines modified in the `volumeKPIs` useMemo block (lines 296-416).

