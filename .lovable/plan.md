

## Fix: Chart's last data point must match the displayed current value

### Problem
`generateGrowthTrend` adds `(Math.random() - 0.5) * 2` noise to every point, including the last one. So the chart's final value drifts slightly from the real KPI value shown in the modal header (e.g., 390,397.7 vs 390,397.2).

### Fix: `src/pages/staffing/StaffingSummary.tsx`
In the `generateGrowthTrend` function (line ~103), clamp the last data point to exactly equal `end` — no random noise on the final point.

```typescript
const generateGrowthTrend = (start: number, end: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: i === points - 1
      ? end
      : start + ((end - start) * i) / (points - 1) + (Math.random() - 0.5) * 2
  }));
```

Same fix in `src/config/kpiConfigs.ts` (line ~4) for consistency.

### Scope
Two one-line edits across two files.

