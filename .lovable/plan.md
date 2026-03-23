

## Revert Target Vol KPI to Default Area Chart

### What
Remove the custom historical volume chart from the Target Vol KPI card in Staffing Summary. The Volume Settings tab already shows that chart via `TargetVolumePopover` — no need to duplicate it on the KPI modal. The Target Vol KPI should use the standard area chart like all other volume KPIs.

### Changes

#### 1. `src/pages/staffing/StaffingSummary.tsx`
- Remove the `targetVolChartContent` useMemo block (the one that builds the ComposedChart with lowest-3 highlights and reference lines)
- Remove `customChartContent: targetVolChartContent` from the `target-vol` KPI config object
- Remove unused imports (`ComposedChart`, `Line`, `ReferenceLine`, `Legend`, `ResponsiveContainer`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip` from recharts, and `format` from date-fns) — only if they're not used elsewhere in the file

### Files Changed
- `src/pages/staffing/StaffingSummary.tsx`

