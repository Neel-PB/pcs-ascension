

# Fix: Shared Position Popover Content Being Cut Off

## Problem

When selecting "Shared Position" in the Active FTE popover, the additional fields (Shared With, Shared FTE, Shared Expiry Date) expand the form height significantly. The bottom of the popover—including the Save button—is being cut off and hidden behind the viewport boundary.

## Root Cause

1. **Fixed `side="top"`**: The popover is configured to always open above the trigger, which doesn't give it room to expand downward when content grows
2. **No scrollability**: When the content becomes taller than available viewport space, there's no scroll mechanism
3. **Collision handling limitations**: Even with `avoidCollisions={true}`, the popover may not have enough room in either direction for the expanded content

---

## Solution

### Make Popover Content Scrollable

Wrap the popover content in a `ScrollArea` component with a max height constraint. This ensures:
- The popover stays within viewport bounds
- All content remains accessible via scrolling
- The Save button is always reachable

### Update PopoverContent Configuration

1. Allow the popover to prefer "top" but flip to "bottom" if there's more room
2. Add a max-height constraint with internal scroll
3. Use higher z-index to ensure proper layering

---

## Technical Changes

| File | Change |
|------|--------|
| `src/components/editable-table/cells/EditableFTECell.tsx` | Wrap popover content in `ScrollArea` with `max-h-[70vh]`; keep collision handling props |

---

## Implementation

```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

// In PopoverContent:
<PopoverContent 
  className="w-80 p-0 z-50"  // Remove padding, add at inner level
  align="center"
  side="top"
  sideOffset={8}
  collisionPadding={20}
  avoidCollisions={true}
>
  <ScrollArea className="max-h-[70vh]">
    <div className="p-4 space-y-4">
      {/* All existing form content */}
    </div>
  </ScrollArea>
</PopoverContent>
```

---

## Expected Outcome

| Scenario | Before | After |
|----------|--------|-------|
| Shared Position selected | Bottom cut off, Save button hidden | Scrollable content, Save button accessible |
| Non-shared status selected | Works fine (shorter content) | No change in behavior |
| Small viewport / row near top | Content cut off | Content scrolls within max height |

