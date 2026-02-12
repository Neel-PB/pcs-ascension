

## Align Variance Analysis Table Styling with Planned/Active Resources

### Goal
Make the Variance Analysis tab's table visually identical to the Position Planning (Planned/Active Resources) table in terms of container styling, header backgrounds, divider colors, and action button sizing.

### Differences Found

| Element | Variance Analysis (current) | Position Planning (target) |
|---|---|---|
| Container | `rounded-lg border bg-card` | `rounded-xl border shadow-sm bg-card overflow-hidden` |
| Header row 1 backgrounds | `bg-card` on each TableHead | `bg-muted/30` on group column headers |
| Header row 2 (sub-headers) | `bg-muted/50` on row and cells | No explicit bg (inherits from table) |
| Action buttons | Default size (`h-10 w-10`) | `h-8 w-8` |
| Legend layout | Stacked vertically | Single horizontal line |

### Changes

**File: `src/pages/staffing/VarianceAnalysis.tsx`**

1. **Table container** (line 720): Change `rounded-lg border bg-card overflow-x-auto` to `rounded-xl border shadow-sm bg-card overflow-hidden overflow-x-auto`

2. **Header row 1** (lines 625-631): Change `bg-card` on each TableHead to `bg-muted/30` to match Position Planning's group header style

3. **Sub-header row** (lines 632-649): Remove `bg-muted/50` from the TableRow and all its TableHead cells -- let them inherit default styling like Position Planning does

4. **Action buttons** (lines 693-711): Add `className="h-8 w-8"` to DataRefreshButton, Download, and Fullscreen buttons to match the resized buttons in Position Planning

5. **Legend layout** (lines 675-684): Change from `flex flex-col gap-0.5` to `flex items-center gap-4` (single horizontal line, matching the Position Planning change)

6. **Modal legend** (lines 735-744): Same horizontal layout fix for the expanded modal's legend

### Files Modified

| File | Change |
|---|---|
| `src/pages/staffing/VarianceAnalysis.tsx` | Container rounding/shadow, header backgrounds, sub-header backgrounds, button sizing, legend layout |

