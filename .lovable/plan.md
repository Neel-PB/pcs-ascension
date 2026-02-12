
## Add Visible Horizontal Divider Between Region Rows

### Problem
Region rows (Region 1, Region 2) don't have a visible divider line between them. The current `border-t-2 border-primary/20` is too subtle against the light blue `bg-primary/10` background, making the regions blend together.

### Fix

**File: `src/pages/staffing/VarianceAnalysis.tsx`** (line 432)

Change the GroupRow's border color from `border-primary/20` to `border-primary/30` for better visibility against the blue-tinted background. This makes the horizontal separator between region rows clearly visible, matching the divider strength seen between skill-level rows.

- Current: `border-t-2 border-primary/20`
- Updated: `border-t-2 border-primary/30`

This is a single-line class change on line 432.
