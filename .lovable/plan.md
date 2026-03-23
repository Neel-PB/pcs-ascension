

## Fix: Date Format on KPI Charts + Remaining Build Errors

### Problem
1. The chart data points use `name: d.day` where `d.day` is the raw ISO date string (e.g., `2026-02-20T00:00:00.000Z`), which shows on chart axes/tooltips
2. Build errors reference `DAY_LABELS_SHORT` and `dayOfWeekData` — these are already removed from the file (confirmed by search), so this is a stale build cache issue. A no-op edit will force a rebuild.

### Changes

#### `src/pages/staffing/StaffingSummary.tsx`

1. **Update label format** (line 346): Change `format(parsed, 'M/d')` to `format(parsed, 'MMM d')` for US-friendly labels like "Feb 20", "Mar 1"

2. **Update chart data `name` field** (lines 734-739): Instead of `name: d.day` (raw ISO), use the formatted label from `dailyTrendLabels`:
   ```
   dailyTrendData.map((d, i) => ({ value: d.paid_fte, name: dailyTrendLabels[i] ?? d.day }))
   ```
   Apply this to all 6 chart data arrays (paid, contract, overtime, prn, np, employed)

This ensures both the X-axis labels and the chart tooltip/name show clean US-format dates like "Feb 20" instead of "2026-02-20T00:00:00.000Z".

