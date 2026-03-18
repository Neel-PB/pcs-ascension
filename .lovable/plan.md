

## Day-of-Week Area/Line Charts for Productive Resources KPIs

**What changes**: All 6 Productive Resources KPIs (Paid FTEs, Contract FTEs, Overtime FTEs, Total PRN, Total NP%, Employed Productive FTEs) will show **day-of-week area/line charts** (Mon → Sun) as their primary chart visualization, using real API data grouped by `day_of_week`.

### Changes

**1. `src/pages/staffing/StaffingSummary.tsx`**

Add a new memo that aggregates `prKpiData` by `day_of_week`, producing an ordered array (Monday → Sunday) with summed FTE metrics and weighted NP% per day:

```text
dayOfWeekData = [
  { day: "Monday", paid_fte: 12.3, contractor_fte: 2.1, overtime_fte: 1.5, total_prn: 0.8, employed_productive_fte: 10.2, npPercent: 9.7 },
  { day: "Tuesday", ... },
  ...
  { day: "Sunday", ... }
]
```

Then update each of the 6 Productive Resources KPI card configs to:
- Use `dayOfWeekData` as `chartData` (with appropriate value mapping)
- Set `chartType` to `"area"` 
- Pass `xAxisLabels` with day names
- Remove `showAllOptions: true` (single chart view, not multi-option)

**2. `src/components/staffing/KPIChartModal.tsx`**

For these KPIs, the modal will render a shadcn `AreaChart` (or `LineChart`) with:
- X-axis: day of week (Mon–Sun)
- Y-axis: the relevant metric value
- Gradient fill under the area curve
- Standard `ChartTooltip` on hover

The existing area/line chart rendering logic in KPIChartModal already supports this — we just need the data shaped correctly with a `name`/`value` structure or a custom `dataKey` matching the day-of-week aggregation.

