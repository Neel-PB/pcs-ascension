

# Fix Active FTE and Expiry Vertical Alignment in Standard Layout

## Problem

In the standard (non-shared) layout, the two grid columns have mismatched label heights:
- **Left column**: Plain `<Label>Active FTE</Label>`
- **Right column**: `<Label>Expiry</Label>` wrapped in a `flex` div with an info icon tooltip, making it slightly taller

This causes the Select dropdown and Date button to sit at different vertical positions. The shared layout doesn't have this issue because its grid labels are both plain `<Label>` elements with no extra wrappers.

## Fix

**File: `src/components/editable-table/cells/EditableFTECell.tsx`**

**Line 317** -- Add `items-end` to the grid container so both input controls align at their bottom edges regardless of label height differences:

```tsx
// Before
<div className="grid grid-cols-2 gap-2">

// After  
<div className="grid grid-cols-2 gap-2 items-end">
```

This single class addition ensures the Select and Date button are always vertically aligned, even when the Expiry label row is taller due to the info icon tooltip.
