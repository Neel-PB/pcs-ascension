

## Fix Date Picker Spacing to Match Helix Spec

### Problem

The vertical spacing inside the date picker popover is too generous because padding stacks between sections:

- Header: `py-6` = 24px top + 24px bottom
- Calendar component: `pt-6` = 24px top padding (built into `calendar.tsx`)

This creates ~48px of dead space between the header text and the calendar navigation row.

### Fix

**File: `src/components/editable-table/cells/EditableDateCell.tsx`**

1. Reduce the header padding from `py-6` to `pt-4 pb-2` -- tighter top, minimal bottom
2. Override the Calendar's built-in top padding by passing a className that replaces `pt-6` with `pt-2`
3. Reduce footer padding from `py-2` to `py-1.5` for a slightly tighter bottom

Specifically:

- Line 127: Change `<div className="px-4 py-6">` to `<div className="px-4 pt-4 pb-2">`
- Line 145: Change `className={cn("pointer-events-auto")}` to `className={cn("pointer-events-auto pt-2")}` -- the `pt-2` will override the Calendar's default `pt-6` via Tailwind merge since the Calendar uses `cn()` to merge its base classes with the passed className

These are small padding tweaks in a single file. The Calendar component itself stays unchanged so other usages are unaffected.

