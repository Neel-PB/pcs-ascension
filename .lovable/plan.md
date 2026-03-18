

## Clean Up Pie Chart UI

### Problem
The current pie chart has overlapping external labels with messy label lines, too many tiny slices creating visual clutter, and the chart feels off-center and hard to read.

### Solution — Clean Donut with Side Legend, No External Labels

**File: `src/components/staffing/KPIChartModal.tsx`**

1. **Group small slices into "Other"** — any skill mix under 3% of total gets merged into a single "Other" slice, reducing visual noise from 10+ slices to ~4-5 meaningful ones

2. **Remove all external labels** — no more overlapping text and label lines. The donut center shows "Total" and the value. Users hover for detail via tooltips.

3. **Two-column layout: Chart left, Legend right** — instead of cramming a horizontal legend below, place a vertical legend list on the right side with colored dots, skill name, FTE count, and percentage. This is much easier to scan.

4. **Center the donut properly** — `cx="50%"`, `cy="50%"` with better radius proportions

5. **Refined color palette** — use well-spaced, accessible colors that are distinct even for colorblind users

### Layout sketch
```text
┌─────────────────────────────────────────────┐
│  Open Reqs                  Current: 1,451  │
│  ┌─────────┐ ┌────────────┐                 │
│  │  Chart   │ │   Table    │                 │
│  └─────────┘ └────────────┘                 │
│                                             │
│   ┌──────────────┐   ● RN      1,060  73%  │
│   │              │   ● PCT       305  21%  │
│   │    Total     │   ● CL        44   3%  │
│   │    1,451     │   ● Other     42   3%  │
│   │              │                          │
│   └──────────────┘                          │
│                                             │
│  Total: 1,451                       [Close] │
└─────────────────────────────────────────────┘
```

### Changes detail
- Add `groupedPieData` memo: sort by value desc, group items < 3% into "Other"
- Remove `label` and `labelLine` props from `<Pie>`
- Replace `<Legend>` with a custom right-side vertical list showing color dot + name + value + %
- Use flexbox: chart on left (flex-1), legend list on right (w-48)
- Increase `outerRadius` to 120, `innerRadius` to 70 for better proportions
- Table view remains unchanged (already clean)

Single file change: `src/components/staffing/KPIChartModal.tsx`

