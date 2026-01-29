

# Remove Scroll and Use Smart Positioning

## Problem

The current implementation has a fixed max-height with internal scrolling, which the user doesn't want. Instead, the popover should automatically position itself so all content is visible without scrolling, staying within viewport bounds.

---

## Solution

Re-enable collision avoidance so the popover smartly positions itself (flipping to top if needed) to ensure all content fits within the viewport without requiring any scroll.

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Update PopoverContent to enable smart positioning (Lines 269-278)

```typescript
// BEFORE:
<PopoverContent 
  className="w-80 p-0 z-50"
  align="end"
  side="bottom"
  sideOffset={8}
  collisionPadding={16}
  avoidCollisions={false}
>
  <div className="flex flex-col max-h-[420px]">
    <div className="flex-1 min-h-0 overflow-y-auto p-3">

// AFTER:
<PopoverContent 
  className="w-80 p-0 z-50"
  align="end"
  side="bottom"
  sideOffset={8}
  collisionPadding={16}
  avoidCollisions={true}
>
  <div className="flex flex-col">
    <div className="p-3">
```

Key changes:
- **`avoidCollisions={true}`** - Radix will automatically flip the popover to the top or adjust position if content would overflow the viewport
- **Removed `max-h-[420px]`** - No height constraint needed since content will always fit
- **Removed `overflow-y-auto` and `min-h-0`** - No scrolling needed

---

## How It Works

| Scenario | Behavior |
|----------|----------|
| Row near top of table | Popover opens below, all content visible |
| Row near bottom of table | Popover flips to open above the trigger |
| Content height changes | Radix recalculates position to keep content in viewport |

---

## Trade-off

This means the popover may appear above or below the trigger depending on available space. The position will be consistent for any given row location, but different rows may have popovers in different positions relative to viewport edges.

