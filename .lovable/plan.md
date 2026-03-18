

## Remove Title Label from Productive Resources Area Chart Tooltips

**Problem**: The area chart tooltip for Productive Resources KPIs shows the KPI title (e.g., "Paid FTEs") as a label. User wants only the day name (e.g., "Monday") and the value — no title label.

### Change

**`src/components/staffing/KPIChartModal.tsx`** (line 923):

Replace the default `ChartTooltipContent` in the area chart with a custom formatter that hides the label:

```tsx
// Before
<ChartTooltip content={<ChartTooltipContent />} />

// After
<ChartTooltip content={<ChartTooltipContent hideLabel={false} labelFormatter={(label) => label} formatter={(val) => <span className="font-mono font-medium">{Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>} hideIndicator />} />
```

This will show only the day name (from `period`/x-axis) as the label and the numeric value — without the KPI title like "Paid FTEs" appearing as a series name.

