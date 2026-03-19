

## Fix: Show All Skill Mix Categories in FTE Charts

**Problem**: The KPI chart modal (line 69-80 in `KPIChartModal.tsx`) has a 3% threshold that groups any skill with value below 3% of total into a single "Other" bucket. This collapses skills like ANM, Director, Manager, Ops Coordinator, Practice Specialist, Clerk into "Other" — leaving only RN, PCT, CL, and Other visible.

**Solution**: Remove or relax the small-slice grouping threshold so all individual skill types appear in the donut chart.

### Change

**File: `src/components/staffing/KPIChartModal.tsx`** (lines 69-80)

Update `filteredPieData` to show all non-zero slices without grouping small ones into "Other":

```tsx
const filteredPieData = useMemo(() => {
  if (!isPie || !chartData) return chartData;
  return chartData
    .filter((d: any) => d.value > 0)
    .sort((a: any, b: any) => b.value - a.value);
}, [isPie, chartData]);
```

This removes the 3% threshold logic entirely, ensuring every skill (RN, PCT, CL, ANM, Director, Manager, Ops Coordinator, Practice Specialist, Clerk, etc.) gets its own slice in the donut chart with its own legend entry.

