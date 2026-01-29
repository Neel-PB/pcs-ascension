

# Fix Popover Content Overflow Issue

## Problem

The popover content is being cut off at the bottom, as shown in the screenshot. The "Status / Reason" form with "Shared Position" selected shows the "Share With" section partially visible but there's no scrollbar to access the rest of the content.

The issue is with the CSS:
1. `overflow-hidden` on `PopoverContent` (line 270) blocks the scrollbar from appearing
2. The inner scrollable container needs proper height constraints to enable scrolling

---

## Solution

Fix the overflow and height constraints so the inner content scrolls properly while keeping the popover in a fixed position.

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Update PopoverContent className (Line 270)

Remove `overflow-hidden` from PopoverContent and let the inner container handle scrolling:

```typescript
// BEFORE:
className="w-80 p-0 z-50 max-h-[420px] overflow-hidden"

// AFTER:
className="w-80 p-0 z-50"
```

#### Change 2: Fix the flex container height calculation (Line 277)

The flex container needs a proper height constraint that accounts for the actions section:

```typescript
// BEFORE:
<div className="flex flex-col max-h-[420px]">
  <div className="flex-1 overflow-y-auto p-3">

// AFTER:
<div className="flex flex-col max-h-[420px]">
  <div className="flex-1 min-h-0 overflow-y-auto p-3">
```

The key fix is adding `min-h-0` to the scrollable container. In flexbox, children default to `min-height: auto` which prevents them from shrinking below their content size. Adding `min-h-0` allows the element to shrink and enables the `overflow-y-auto` to work correctly.

---

## Why This Works

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| No scrollbar visible | `overflow-hidden` on parent | Remove it from PopoverContent |
| Content not scrolling | Flex child min-height default | Add `min-h-0` to allow shrinking |
| Container height | Double max-h constraint | Keep only on outer flex container |

---

## Visual Result

- Popover stays in fixed position (no jumping)
- Content scrolls when it exceeds 420px height
- Scrollbar appears when needed
- Save/Revert buttons stay sticky at bottom

