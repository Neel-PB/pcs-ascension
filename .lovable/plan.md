

## Fix: Center-Align Donut/Pie Chart in KPI Modal

**Problem**: The donut chart appears left-aligned because it fills the entire `flex-1` container width while the legend sits in a fixed `w-48` column on the right. The pie is centered within its own SVG but not visually centered in the modal.

**Solution**: Center the donut chart within its flex container using flexbox centering, and cap the chart width so it doesn't stretch across the full available space.

### Change

**File: `src/components/staffing/KPIChartModal.tsx`**

**Line 836** — Update the pie/donut flex container layout:
```tsx
// Before:
<div className="flex items-center gap-4 h-[320px]">

// After:
<div className="flex items-center justify-center gap-4 h-[300px]">
```

**Line 838** — Constrain the chart container so it doesn't stretch too wide, keeping the donut visually centered:
```tsx
// Before:
<div className="flex-1 h-full min-w-0">

// After:
<div className="flex-1 h-full min-w-0 flex items-center justify-center">
```

**Line 839** — Cap the ChartContainer max-width so the donut stays compact:
```tsx
// Before:
<ChartContainer config={pieConfig} className="h-full w-full">

// After:
<ChartContainer config={pieConfig} className="h-full w-full max-w-[320px]">
```

These three changes ensure the donut chart is visually centered within the modal, with the legend remaining on the right side.

