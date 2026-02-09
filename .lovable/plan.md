

# Fix Header Row Background Consistency

## Issue

The header rows in the Variance Analysis table don't have explicit forced backgrounds on all cells, unlike the data rows which were already fixed. This can cause subtle inconsistencies:

1. **Header Row 1** (line 608-614): The sticky cell uses `bg-card` but the skill group header cells (`TableHead colSpan={3}`) have no background class at all.
2. **Header Row 2** (line 616-633): The `TableRow` has `bg-muted/50` and the sticky cell has `bg-muted/50`, but the Day/Night/Total sub-header cells have no explicit background.

The global `TableBody` striping doesn't affect `TableHeader`, but the lack of explicit backgrounds on header cells could still show inconsistencies depending on how the browser renders the sticky cell vs non-sticky cells.

## Proposed Fix

### File: `src/pages/staffing/VarianceAnalysis.tsx`

**Header Row 1 (lines 609-614)**: Add `bg-card` to all skill group `TableHead` cells so they match the sticky Regions header:

| Cell | Current | After |
|------|---------|-------|
| CL Skill (line 610) | No bg class | `bg-card` |
| RN Skill (line 611) | No bg class | `bg-card` |
| PCT Skill (line 612) | No bg class | `bg-card` |
| HUC (line 613) | No bg class | `bg-card` |
| Overhead (line 614) | No bg class | `bg-card` |

**Header Row 2 (lines 618-632)**: Add `bg-muted/50` to all Day/Night/Total `TableHead` cells so they match the sticky empty header:

All 15 sub-header cells get `bg-muted/50` added to their className.

This ensures every cell in every row -- headers included -- has an explicit background, eliminating any possible rendering discrepancy between sticky and non-sticky cells.

