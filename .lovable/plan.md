
## Fix Vacancy Rate / Target FTE donut sizing and remove extra legend space

### What’s actually wrong
The earlier size changes were applied to the wrong chart branch.

- **Hired FTEs / Open Reqs** use the `nested-pie` renderer and are already using the larger 440x440 layout.
- **Vacancy Rate / Target FTEs** use the `dual-pie` renderer, which is still on the old small layout:
  - chart container: `w-[200px] h-[200px]`
  - radii: `outerRadius={80}`, `innerRadius={45}`
  - wrapper spacing: `space-y-3` + extra legend padding

That is why you still see small donuts and empty space around/below the legend.

### Changes

**File: `src/components/staffing/KPIChartModal.tsx`**

1. **Update the `isDualPie` chart block** (the branch starting around line 845)
   - change each Day/Night chart container from `200x200` to the larger size used for the FTE modals
   - increase the donut radii so the charts actually fill the container
   - scale the center label/value so it stays readable at the larger size

2. **Tighten the dual-pie layout**
   - reduce the outer wrapper spacing (`space-y-3`)
   - reduce legend top padding (`pt-1`)
   - keep the legend directly under the charts instead of leaving visible dead space

3. **Keep the current structure**
   - Vacancy Rate and Target FTEs will still show **2 separate charts** (Day and Night)
   - Hired FTEs and Open Reqs will still show **nested inner/outer rings**
   - only the visual size/spacing of Vacancy Rate and Target FTEs will change

### Expected result
- Vacancy Rate and Target FTEs donuts become visually much larger
- They will feel closer in footprint/height to Hired FTEs and Open Reqs
- The empty space around/below the legend will be removed or greatly reduced

### Technical note
This should be a **single-file fix** in `KPIChartModal.tsx`. No backend or data-shape changes are needed unless you later want Vacancy/Target to switch from separate Day/Night donuts to the nested inner/outer style.
