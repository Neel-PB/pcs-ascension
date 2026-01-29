

# Adaptive Height with Smooth Position Transitions

## Problem

The fixed `min-h-[360px]` creates an awkward large empty space between the Status/Reason dropdown and the Save button, as shown in the screenshot. This looks odd when only the simple form is displayed.

## Solution

Instead of reserving space with a fixed height, use a different approach:

1. **Remove the fixed min-height** - No empty space
2. **Keep collision avoidance enabled** - Popover positions correctly based on viewport
3. **Add CSS transitions to the popover** - Position changes animate smoothly instead of jumping abruptly

This way the popover will still reposition when content expands, but it will be a smooth animated slide rather than a jarring jump.

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Remove min-height from content container (Line 278)

```typescript
// BEFORE:
<div className="p-3 min-h-[360px]">

// AFTER:
<div className="p-3">
```

### File: `src/components/ui/popover.tsx`

#### Change 2: Add transition for smooth repositioning (Lines 18-20)

Add a CSS transition to the PopoverContent so position changes animate:

```typescript
// BEFORE:
className={cn(
  "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out ...",
  className,
)}

// AFTER:
className={cn(
  "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none transition-[transform,opacity] duration-200 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out ...",
  className,
)}
```

---

## How It Works

| State | Behavior |
|-------|----------|
| Open popover | Natural height, positioned correctly for viewport |
| Select Shared Position | Content expands with animation |
| Popover repositions | Position change animates smoothly (200ms) |
| Result | Feels like a cohesive expansion rather than a jump |

---

## Visual Result

- No empty space when showing simple form
- Content expansion animates smoothly
- Popover position changes slide rather than jump
- All content remains accessible without scrolling

