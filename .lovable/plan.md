

# Fix Row Colors in Variance Analysis Table

## Problem
Same issue as Position Planning: the global `TableBody` even/odd striping (`nth-child(even):bg-muted/30`) overrides the row backgrounds, causing inconsistent coloring on group and child rows.

## Solution

### File: `src/pages/staffing/VarianceAnalysis.tsx`

**GroupRow (line 432):** Force the light blue background:
- Change `bg-primary/5 hover:bg-primary/10` to `!bg-primary/10 hover:!bg-primary/15`
- Also update the sticky cell background on line 435 from `bg-primary/5` to `bg-primary/10`

**SkillRow (line 500):** Force the default background:
- Change `bg-primary/5` to `!bg-background`
- Update sticky cell background on line 501 from `bg-primary/5` to `bg-background`

| Row Type | Current | After |
|----------|---------|-------|
| Group (Submarket headers) | `bg-primary/5` (faint, overridden by striping) | `!bg-primary/10` (forced light blue) |
| Child (Facility rows) | `bg-primary/5` (faint, overridden by striping) | `!bg-background` (forced default) |

