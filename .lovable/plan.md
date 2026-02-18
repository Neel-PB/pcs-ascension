

## Fix: Align cell row spacing to match column header gap

### Problem
The column headers use `flex items-center gap-2` for consistent spacing between label, icons, and menu. The row cells (Active FTE and Shift) either lack `gap-2` or still use absolute positioning for icons, creating inconsistent spacing compared to the header.

### Changes

**1. `src/components/editable-table/cells/EditableFTECell.tsx`**
- Add `gap-2` to the button's className (line 254-258) so the value and icon have the same spacing as the header.

Before: `"flex items-center justify-between"`
After: `"flex items-center justify-between gap-2"`

**2. `src/components/editable-table/cells/ShiftCell.tsx` (special shifts, lines 91-119)**
- Convert from `relative` + absolute icon positioning to `flex items-center justify-between gap-2`, matching the Active FTE layout.
- Remove `pr-6` padding hack from the value spans since flex + gap handles spacing.
- Remove `absolute right-2 top-1/2 -translate-y-1/2` from the icon elements and add `shrink-0`.

The special shift button becomes:
```tsx
<button
  className={cn(
    "w-full h-full text-left px-4 py-2",
    "text-sm font-normal text-foreground",
    "hover:bg-muted/50 transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "flex items-center justify-between gap-2"
  )}
  type="button"
>
  {/* value span without pr-6 */}
  {/* icon without absolute positioning, with shrink-0 */}
</button>
```

### Summary
Two files changed. Both cell types will now use `flex items-center justify-between gap-2` matching the header's `gap-2` spacing pattern for visual consistency.
