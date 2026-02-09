

# Fix Variance Analysis - Row Background Override Conflict

## Root Cause

The previous fix added `[&_tr:nth-child(even)]:!bg-transparent` to `TableBody`, which uses `!important` to force even rows transparent. But this **overrides** the `!bg-primary/10` and `!bg-muted/20` classes that GroupRow and TotalRow apply to their `<tr>` elements. So on even rows, the row background disappears entirely, while the sticky cell (which has its own explicit `!bg-primary/10`) keeps its color -- creating a mismatch.

## Solution

Instead of fighting specificity with `!important` on TableBody, remove the global striping override and instead apply explicit background classes to **all non-sticky `<td>` cells** within each row type so they always match the sticky cell. This is the most reliable approach since each cell controls its own background.

### File: `src/pages/staffing/VarianceAnalysis.tsx`

**Step 1** -- Remove the TableBody override (line 666):
```tsx
// Revert back to:
<TableBody>
```

**Step 2** -- Add explicit `!bg-primary/10` to all data cells in **GroupRow** (lines 446-490):
Every `<TableCell>` in GroupRow currently has no background class. Add `!bg-primary/10` to each one so they match the sticky cell and override the even-row striping.

**Step 3** -- Add explicit `!bg-background` to all data cells in **SkillRow** (lines 540-580):
Every `<TableCell>` in SkillRow needs `!bg-background` to match its sticky cell.

**Step 4** -- Add explicit `!bg-muted/20` to all data cells in **TotalRow** (lines 588-630):
Every `<TableCell>` in TotalRow needs `!bg-muted/20` to match its sticky cell.

This ensures every cell in every row has the same forced background, so neither the sticky column nor the data columns can be tinted differently by global striping rules. The border fix (`border-r-2 border-muted-foreground/30`) on the sticky cell remains unchanged.

