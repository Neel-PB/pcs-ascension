

## Fix: Use Real Month Labels Instead of P1, P2 in KPI Chart Modals

**Problem**: The KPI chart modal X-axis shows "P1, P2..." instead of actual month names (e.g., "Mar'25", "Apr'25") because the label-matching logic requires exactly 12 labels matching exactly 12 data points. Real data may have fewer months (e.g., 11).

### Change

**File: `src/components/staffing/KPIChartModal.tsx`** (lines 135-152)

Update the `enrichedData` logic to use `xAxisLabels` whenever the label count matches the data count, instead of hardcoding `=== 12`:

```tsx
// Before: only works when exactly 12 labels and 12+ data points
const dataToUse = xAxisLabels && xAxisLabels.length === 12 
  ? chartData.slice(-12) 
  : chartData;

return dataToUse.map((item, index) => {
  if (xAxisLabels && xAxisLabels.length === 12 && chartData.length >= 12) {
    return { ...item, period: xAxisLabels[index] };
  }
  return { ...item, period: `P${index + 1}` };
});

// After: use labels whenever they match data length
if (xAxisLabels && xAxisLabels.length > 0) {
  const dataToUse = chartData.slice(-xAxisLabels.length);
  return dataToUse.map((item, index) => ({
    ...item,
    period: xAxisLabels[index] ?? `P${index + 1}`,
  }));
}

return chartData.map((item, index) => ({
  ...item,
  period: `P${index + 1}`,
}));
```

This ensures that when `trendLabels` (e.g., `["Mar'25", "Apr'25", ...]`) are passed from StaffingSummary, they appear on the X-axis regardless of whether there are 11 or 12 months of data.

