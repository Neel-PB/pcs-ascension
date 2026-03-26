

## Fix KPI Layout Breaking When Fewer Cards Are Visible

### Problem
When a Manager or Director logs in, role-based visibility hides certain KPI cards (e.g., Volume section goes from 6 to 5 cards). The current code switches to flex layout when `kpis.length < 6` (line 79), but the breakdown badges/connectors below still hardcode `grid-cols-6`, causing misalignment and visual breakage.

### Changes

**File: `src/components/staffing/DraggableKPISection.tsx`**

1. **Always use grid layout** — remove the `kpis.length < 6` flex-mode branch (lines 77-88). Instead, always use the grid and dynamically set columns based on actual KPI count:
   - 6 items → `xl:grid-cols-6`
   - 5 items → `xl:grid-cols-5`
   - 4 items → `xl:grid-cols-4`
   - etc.

2. **Update volume connector grid** (lines 191-234) — replace hardcoded `grid-cols-6` with the same dynamic column count so connectors align with actual cards.

3. **Update FTE breakdown connector grid** (line 104) — same: replace `grid-cols-6` with dynamic column count and adjust spacer calculations to use actual indices within the visible KPI array.

4. **Remove the flex-mode width calc divs** (lines 84-88) — no longer needed since we always use grid.

### Technical Detail
```tsx
// Compute grid class from kpi count
const gridColsClass = `xl:grid-cols-${Math.min(kpis.length, 6)}`;

// KPI grid - always grid, dynamic cols
<div className={cn("gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4", gridColsClass)}>
  {kpis.map(kpi => <KPICard ... />)}
</div>

// Connectors - use same dynamic class
<div className={cn("hidden xl:grid", gridColsClass, "relative z-10")} ...>
```

The inner connector sub-grids (for Hired+Open Reqs spanning 3 cols, volume drops) will also reference `kpis.length` instead of hardcoded `6`.

