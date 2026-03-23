

## Widen Chart Modal for 28-Day Productive Resources Charts

### Problem
The area charts for Productive Resources KPIs have 28 daily data points that get compressed in the current `max-w-3xl` modal width, making labels overlap and the chart hard to read.

### Change

**`src/components/staffing/KPIChartModal.tsx`** — Line 149

Update the width logic to also widen the modal when chartData has many points (28+ days):

```typescript
// Current
isNestedPie ? "max-w-5xl" : showAllOptions ? "max-w-4xl" : "max-w-3xl"

// Updated — also widen for charts with 20+ data points
isNestedPie ? "max-w-5xl" 
  : (chartData && chartData.length >= 20) ? "max-w-5xl"
  : showAllOptions ? "max-w-4xl" 
  : "max-w-3xl"
```

This ensures the 28-day area charts for Paid FTEs, Contract FTEs, Overtime FTEs, Total PRN, Non-Productive %, and Employed Productive FTEs all render at full width with readable x-axis labels.

### Files Changed
- `src/components/staffing/KPIChartModal.tsx`

