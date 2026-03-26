

## Remove Skill Breakdown Sidebar from Nested Donut Charts

The user wants to remove the "Day (Outer)" / "Night (Inner)" skill breakdown sidebar and the combined legend that were recently added next to the nested donut charts.

### Changes

**File: `src/components/staffing/KPIChartModal.tsx`**

1. **Remove the skill breakdown sidebar** (lines 973-1003) — the `div` containing "Day (Outer)" and "Night (Inner)" lists with per-skill values
2. **Remove the combined legend row** (lines 1009-1025) — the bottom flex row with skill color dots and ring indicators
3. **Remove the `flex items-center gap-4` wrapper** around the chart (line 937) — the chart container no longer needs side-by-side layout, just center the donut directly

The chart container (`w-[340px] h-[340px]`) stays as-is with the enlarged radii.

