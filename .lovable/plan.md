

## Fix Eye Icon Position for Variance KPI Cards

### Problem
When removing chart data from FTE Variance and REQ Variance cards, the eye icon stays vertically centered (`top-1/2 -translate-y-1/2`). User wants it at the **bottom-right**, matching its current visual position when both icons are stacked (chart on top, eye on bottom).

### Changes

**`src/pages/staffing/StaffingSummary.tsx`**
- Set `chartData: []` for `fte-variance` and `req-variance` KPI configs to remove chart icon

**`src/components/staffing/KPICard.tsx`** (line ~101)
- Change the icon container positioning from `top-1/2 -translate-y-1/2` to `bottom-3 right-4` so icons anchor to the bottom-right instead of vertically centering. This keeps the eye icon in the same visual spot whether the chart icon is present or not.

