

# Fix Variance Analysis - Sticky Column Background Mismatch

## Root Cause

The global `TableBody` component in `src/components/ui/table.tsx` applies alternating row striping via `[&_tr:nth-child(even)]:bg-muted/30`. This means every even `<tr>` gets a subtle tint. The non-sticky cells inherit this tint from their parent `<tr>`, but the sticky first cell has its own explicit background (e.g., `!bg-background`, `!bg-primary/10`) which blocks the striping -- making it look different from the rest of the row on even rows.

## Solution

Disable the alternating row striping specifically for the Variance Analysis table by adding a custom class to the `TableBody` that removes the `nth-child` rule.

### File: `src/pages/staffing/VarianceAnalysis.tsx`

**Line 666** - Add a class override to `TableBody` to disable striping:

```tsx
// Current
<TableBody>

// After
<TableBody className="[&_tr:nth-child(even)]:!bg-transparent">
```

This neutralizes the global even-row striping for this table only, so every row type (GroupRow, SkillRow, TotalRow) controls its own background consistently. The sticky first cell and the rest of the row will always match because no external striping interferes.

No other files need changes. The existing `!bg-primary/10`, `!bg-background`, and `!bg-muted/20` classes on the rows already define the correct backgrounds -- they just need the striping to stop overriding the non-sticky cells on even rows.

