

## Fix: Y-Axis Domain for Volume and Productive Resources Charts

**Problem**: Area/line/bar charts in the KPI modals use `domain={['auto', 'auto']}` on the YAxis, which means:
- The Y-axis may not start at 0 (misleading visual scale)
- The max value has no headroom, so the highest data point touches the top edge

**Solution**: Change the YAxis `domain` to start at 0 and extend to max value + 20%.

### Change

**File: `src/components/staffing/KPIChartModal.tsx`**

Update the YAxis `domain` prop in three locations (area chart ~line 910, line chart ~line 940, bar chart ~line 965):

```tsx
// Before (all three):
domain={['auto', 'auto']}

// After (all three):
domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
```

This ensures every Volume and Productive Resources trend chart starts from 0 and has 20% headroom above the highest value. The chart heights remain unchanged unless further adjustment is requested.

