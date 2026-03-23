

## Fix Nested Donut Chart Size and Inner/Outer Ring Spacing

### Problem
The nested donut charts (Hired FTEs, Open Reqs) appear too small and cramped. The inner ring (Night) and outer ring (Day) are too close together, and the overall chart doesn't fill the available space well in the widened modal.

### Changes

**`src/components/staffing/KPIChartModal.tsx`**

1. **Line 932** — Increase the chart container from `220x220` to `280x280`:
   ```typescript
   // Before
   <div className="w-[220px] h-[220px]">
   
   // After
   <div className="w-[280px] h-[280px]">
   ```

2. **Line 947** — Increase inner ring radii (Night) from `outerRadius={50} innerRadius={25}` to `outerRadius={65} innerRadius={35}`:
   ```typescript
   <Pie ... outerRadius={65} innerRadius={35} ...>
   ```

3. **Line 954** — Increase outer ring radii (Day) from `outerRadius={85} innerRadius={60}` to `outerRadius={120} innerRadius={80}`:
   ```typescript
   <Pie ... outerRadius={120} innerRadius={80} ...>
   ```

This creates more visual separation between the inner (Night) and outer (Day) rings and makes the charts fill the wider modal properly.

### Files Changed
- `src/components/staffing/KPIChartModal.tsx`

