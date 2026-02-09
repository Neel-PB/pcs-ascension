

# Fix Variance Analysis Inconsistent Row Colors

## Problem
The sticky first column (`TableCell`) in each row type uses regular `bg-*` classes (without `!`), while the parent `TableRow` uses `!bg-*`. On even-positioned rows, the global striping overrides the sticky cell's background, making it look different from the rest of the row.

In the screenshot: FLPEN and FLJAC rows have slightly different shading on the "Facilities" column vs the data columns.

## Solution

### File: `src/pages/staffing/VarianceAnalysis.tsx`

1. **GroupRow sticky cell (line 435):** Change `bg-primary/10` to `!bg-primary/10`
2. **SkillRow sticky cell (line 501):** Change `bg-background` to `!bg-background`
3. **TotalRow (line 584):** Change `bg-muted/20` to `!bg-muted/20` on both the TableRow and the sticky TableCell (line 585)

| Row | Element | Current | After |
|-----|---------|---------|-------|
| GroupRow | sticky TableCell | `bg-primary/10` | `!bg-primary/10` |
| SkillRow | sticky TableCell | `bg-background` | `!bg-background` |
| TotalRow | TableRow | `bg-muted/20` | `!bg-muted/20` |
| TotalRow | sticky TableCell | `bg-muted/20` | `!bg-muted/20` |

This ensures the sticky first column always matches the rest of the row regardless of even/odd position.
