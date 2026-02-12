

## Make Variance Analysis Table Identical to Planned/Active Resources

### Root Cause
The Variance Analysis table has three styling patterns that Position Planning does not:
1. A **sticky first column** with a visible vertical border (`border-r-2 border-muted-foreground/30`)
2. **Per-cell background overrides** (`!bg-primary/10`, `!bg-background`, `!bg-muted/50` on every single cell)
3. Border color mismatch (`border-primary/30` vs Position Planning's `border-primary/20`)

These create a noticeably different look -- the vertical separator line, the slightly different blue tinting from per-cell overrides, and the heavier row dividers.

### Changes

**File: `src/pages/staffing/VarianceAnalysis.tsx`**

#### 1. GroupRow (lines 431-491)
- Change `border-primary/30` back to `border-primary/20` to match Position Planning
- Remove `sticky left-0` and `border-r-2 border-muted-foreground/30` from the first TableCell
- Remove `!bg-primary/10` from the first TableCell (let row background cascade)
- Remove `!bg-primary/10` from ALL data cells (15 cells) -- let the row-level background apply

#### 2. SkillRow (lines 499-565)
- Remove `sticky left-0` and `border-r-2 border-muted-foreground/30` from the first TableCell
- Remove `!bg-background` from the first TableCell
- Remove `!bg-background` from ALL data cells (15 cells)

#### 3. TotalRow (lines 568-618)
- Remove `sticky left-0` and `border-r-2 border-muted-foreground/30` from the first TableCell
- Remove `!bg-muted/50` from the first TableCell
- Remove `!bg-muted/50` from ALL data cells (15 cells)

#### 4. Header row 1 (lines 624-631)
- Remove `sticky left-0 z-10` and `border-r-2 border-muted-foreground/30` from the first TableHead
- Add `min-w-[200px]` as a width without the sticky/border

#### 5. Header row 2 / sub-header (line 633)
- Remove `sticky left-0 z-10` and `border-r-2 border-muted-foreground/30` from the empty sub-header TableHead

### Result
Both tables will use the same pattern: row-level backgrounds only, no sticky columns, no vertical separator, and matching border opacity. They will look visually identical.

### Technical Note
Removing the sticky first column means the "Regions" label will scroll out of view on very wide tables. This matches how Position Planning behaves -- the "Skills" column also scrolls horizontally. If sticky behavior is needed later, it can be re-added to both tables simultaneously for consistency.

### Files Modified
| File | Change |
|---|---|
| `src/pages/staffing/VarianceAnalysis.tsx` | Remove sticky/border-r-2 from first column, remove per-cell background overrides, fix border-primary opacity |

