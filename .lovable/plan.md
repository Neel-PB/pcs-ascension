

## Align Variance Analysis Table Colors with Planned/Active Resources

### Goal
Make the Variance Analysis table colors and dividers visually identical to the Planned/Active Resources table.

### Differences Found

| Element | Variance Analysis (current) | Position Planning (target) |
|---|---|---|
| Group row border-top | `border-primary/40` | `border-primary/20` |
| Total row background | `!bg-muted/20` | `bg-muted/50` |
| Sub-header first cell | `bg-background` override | No explicit bg |
| First column header | `bg-muted/30` with sticky | Keep sticky but match overall look |

### Changes

**File: `src/pages/staffing/VarianceAnalysis.tsx`**

1. **Group row border color** (line 432): Change `border-primary/40` to `border-primary/20` to match Position Planning's lighter group separator

2. **Total row background** (lines 569-570 and 600-616): Change `!bg-muted/20` to `bg-muted/50` on the TotalRow and all its cells to match Position Planning's total row shading

3. **Sub-header first cell background** (line 633): Remove the explicit `bg-background` from the sticky sub-header cell -- let it inherit naturally like Position Planning does

### Files Modified

| File | Change |
|---|---|
| `src/pages/staffing/VarianceAnalysis.tsx` | Group border color, total row background, sub-header cell background |

