

## Fix Dual Donut Chart Sizing & Remove Legend Whitespace

### Issues
1. **Extra space below skill legend** in the nested donut section — the `gap-3` on the outer flex-col adds unnecessary spacing
2. **Dual donut charts (Vacancy Rate, Target FTEs)** are smaller (`320x300`, radii `120/70`) than the nested donuts (`340x340`, radii `145/100`)

### Changes

**File: `src/components/staffing/KPIChartModal.tsx`**

1. **Reduce gap on nested donut container** (line 918): Change `gap-3` → `gap-1` to tighten space between charts and legend

2. **Enlarge dual donut charts** (lines 994-1035): Match the nested donut sizing:
   - Container: `w-[320px] h-[300px]` → `w-[340px] h-[340px]`
   - Outer wrapper: `h-[300px]` → remove fixed height constraint
   - `outerRadius={120}` → `outerRadius={145}`
   - `innerRadius={70}` → `innerRadius={100}`
   - Center text: adjust `text-[11px]` → `text-[9px]` and `text-lg` → `text-sm` to match nested style

Result: All FTE donut charts will be the same large size, and no extra whitespace below legends.

