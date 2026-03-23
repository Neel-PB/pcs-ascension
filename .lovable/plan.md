

## Show Target Volume Historical Chart in KPI Chart Modal

### What
When clicking the chart icon on the "Target Vol" KPI card, show the same historical volume line chart from `TargetVolumePopover` — with highlighted lowest-3 dots, N-month avg and 3-month low avg reference lines, and the legend. No spread percentage, no calculation details — just the chart and legend.

### Changes

#### 1. `src/components/staffing/KPICard.tsx` & `src/components/staffing/KPIChartModal.tsx`
Add an optional `customChartContent?: React.ReactNode` prop. When provided, the modal renders it instead of the default chart.

#### 2. `src/pages/staffing/StaffingSummary.tsx`
For the `target-vol` KPI config, compute the chart data from `pvFilteredRecords` (using `last_12_month_volume_stats`) and pass a `customChartContent` with a `ComposedChart` containing:
- Line with highlighted lowest-3 month dots (orange)
- N-month avg dashed reference line (primary)
- 3-month low avg dashed reference line (orange)
- Legend showing Monthly Volume, Lowest 3, N-Mo Avg, 3-Mo Low

Data derivation (in a `useMemo`):
- Parse `last_12_month_volume_stats` from the first matching record
- Sort months to find lowest 3 by daily volume
- Compute n-month avg and 3-month low avg from the record's existing fields (`dly_avg_volume_12mth`, `dly_avg_volume_3mth_low`)

#### 3. `src/components/workforce/WorkforceKPICard.tsx`
Add the same `customChartContent` prop passthrough so the workforce drawer's Target Vol KPI also shows this chart.

### Files Changed
- `src/components/staffing/KPICard.tsx`
- `src/components/staffing/KPIChartModal.tsx`
- `src/components/workforce/WorkforceKPICard.tsx`
- `src/pages/staffing/StaffingSummary.tsx`

