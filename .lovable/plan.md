

## Set Minimum Width for All KPI Chart Modals

### Problem
Volume and Productive Resources charts look congested in narrower modals. The current logic only widens for `nested-pie` or 20+ data points, leaving other chart types (pie, area with fewer points, volume trends) in `max-w-3xl` which is too narrow.

### Change

**`src/components/staffing/KPIChartModal.tsx`** — Line 149

Replace the conditional width logic with a single consistent minimum width for all chart modals:

```typescript
// Before (conditional)
isNestedPie ? "max-w-5xl" : (Array.isArray(chartData) && chartData.length >= 20) ? "max-w-5xl" : showAllOptions ? "max-w-4xl" : "max-w-3xl"

// After — max-w-5xl for all modals
"max-w-5xl"
```

This gives every chart type (area trends, pie/donut, dual-pie, nested-pie, volume charts) enough room to render clearly without congestion.

### Files Changed
- `src/components/staffing/KPIChartModal.tsx`

