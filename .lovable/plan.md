

# Fix: Shared Position Popover Dynamic Height Constraint

## Problem Diagnosis

After testing, I found the real issue: when selecting "Shared Position" on a row near the **top** of the table, the popover flips to open downward (since there's no room above). But the fixed `max-h-[70vh]` doesn't account for the actual available space below, causing the popover to extend beyond the viewport and clip the Save button.

The `ScrollArea` with `max-h-[70vh]` works when the popover opens upward with plenty of space, but fails when space is limited in the direction the popover opens.

---

## Root Cause

1. **Fixed max-height**: `max-h-[70vh]` is arbitrary and doesn't adapt to actual available space
2. **Radix provides available height**: The CSS variable `--radix-popper-available-height` contains the exact space available for the popover
3. **Viewport clipping**: When available height is less than content height + 70vh, content is clipped

---

## Solution

Use the Radix-provided CSS variable for dynamic height constraint:

```tsx
<PopoverContent 
  className="w-80 p-0 z-50" 
  align="center"
  sideOffset={8}
  collisionPadding={20}
  avoidCollisions={true}
>
  <ScrollArea 
    className="max-h-[--radix-popper-available-height]"
    style={{ maxHeight: 'calc(var(--radix-popper-available-height, 70vh) - 20px)' }}
  >
    <div className="p-4 space-y-4">
      {/* Form content */}
    </div>
  </ScrollArea>
</PopoverContent>
```

This approach:
- Uses the **actual available height** reported by Radix
- Subtracts 20px for the `collisionPadding` 
- Falls back to `70vh` if the variable isn't available
- Ensures the Save button is always visible within the scrollable area

---

## Technical Changes

| File | Change |
|------|--------|
| `src/components/editable-table/cells/EditableFTECell.tsx` | Replace `max-h-[70vh]` with dynamic height based on `--radix-popper-available-height` |

---

## Expected Behavior

| Scenario | Before | After |
|----------|--------|-------|
| Click Active FTE near **top** of table (popover opens downward) | Save button cut off | Scrollable area fits available space, Save button accessible |
| Click Active FTE near **bottom** of table (popover opens upward) | Works but could still clip | Dynamically sized to available space |
| Any screen size | Fixed 70vh constraint | Adaptive to actual available viewport space |

