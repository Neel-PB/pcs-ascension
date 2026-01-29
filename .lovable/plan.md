

# Fix Popover Position Jumping During Form State Changes

## Problem

When the user selects different statuses or navigates through the "Share With" cascading selection, the popover repositions itself to a different location. This happens because:

1. The popover uses `avoidCollisions={true}` which recalculates position when content height changes
2. The `sticky="partial"` setting allows repositioning during layout changes
3. Dynamic content (Status form vs Shared Position form) causes significant height changes

This makes it confusing because the form appears in one position initially, then jumps to a different location after making a selection.

---

## Solution

Disable collision avoidance repositioning after the popover opens and use a fixed maximum height with internal scrolling. This ensures the popover stays in place while content changes.

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Update PopoverContent Props (Lines 269-277)

Replace collision-based positioning with fixed positioning:

```typescript
// BEFORE:
<PopoverContent 
  className="w-80 p-0 z-50"
  align="end"
  side="bottom"
  sideOffset={8}
  collisionPadding={16}
  avoidCollisions={true}
  sticky="partial"
>

// AFTER:
<PopoverContent 
  className="w-80 p-0 z-50 max-h-[420px] overflow-hidden"
  align="end"
  side="bottom"
  sideOffset={8}
  collisionPadding={16}
  avoidCollisions={false}
>
```

Key changes:
- **`avoidCollisions={false}`** - Prevents repositioning when content height changes
- **`max-h-[420px]`** - Fixed maximum height to contain all possible content
- **Removed `sticky="partial"`** - No longer needed without collision avoidance

#### Change 2: Add Scrollable Content Container (Lines 278-620)

Wrap the form content in a scrollable container so users can access all fields even if the popover is near viewport edges:

```typescript
// BEFORE:
<div className="p-3">
  {/* Status / Reason Dropdown */}
  ...
  {/* Dynamic content area */}
  ...
  {/* Actions */}
</div>

// AFTER:
<div className="flex flex-col max-h-[420px]">
  <div className="flex-1 overflow-y-auto p-3">
    {/* Status / Reason Dropdown */}
    ...
    {/* Dynamic content area */}
    ...
  </div>
  {/* Actions - sticky at bottom */}
  <div className="flex gap-2 p-3 pt-3 border-t bg-popover sticky bottom-0">
    ...
  </div>
</div>
```

This ensures:
- Content scrolls internally when it exceeds the max height
- Save/Revert buttons stay visible at the bottom
- Form position remains fixed regardless of content changes

---

## Visual Result

| Scenario | Before | After |
|----------|--------|-------|
| Select status | Popover may reposition | Popover stays fixed |
| Switch to Shared Position | Popover jumps to new location | Content scrolls, popover stays |
| Cascading selects expand | Position shifts based on viewport | Smooth scroll, no jump |

---

## Alternative Approach (If scrolling is undesirable)

If the user prefers no scrolling and wants all content visible at once, we can:
1. Keep `avoidCollisions={true}` for initial positioning only
2. Set the popover to a fixed height that accommodates the largest state (Shared Position with all fields)
3. Use invisible placeholder divs to reserve space for all possible fields

This would require a larger minimum height (~380px) but would eliminate both repositioning and scrolling.

