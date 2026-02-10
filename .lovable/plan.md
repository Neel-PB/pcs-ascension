

# Two-Column Split Layout for Shared Position

## Problem

The Shared Position form stacks too many fields vertically, causing the popover to overflow. The user wants a two-column layout to spread content horizontally instead.

## Solution

When "Shared Position" is selected, the dynamic section renders as a **two-column grid** instead of a single stacked column. The popover width increases to accommodate the extra column.

### Layout

```text
+-----------------------------------------------------+
| Status / Reason                              [v]     |
|                                                      |
|  LEFT COLUMN              |  RIGHT COLUMN            |
|  Active FTE    [0.5  v]   |  Share With              |
|  Expiry     [Jun 30   x]  |  [Dept Name badge] [x]  |
|                            |  Shared FTE   [0.3  v]  |
|                            |  Shared Expiry [Jun x]  |
|                                                      |
| Comment (optional)                                   |
| [                                                  ] |
|------------------------------------------------------|
| [Revert]                                    [Save]   |
+-----------------------------------------------------+
```

- **Left column**: Active FTE + Expiry (stacked vertically)
- **Right column**: Share With (badge or cascading selects) + Shared FTE + Shared Expiry (stacked vertically)
- **Comment**: Full-width below both columns
- Status/Reason and footer remain full-width

## Technical Changes

**File: `src/components/editable-table/cells/EditableFTECell.tsx`**

### Change 1: Widen popover for Shared Position

The PopoverContent currently has a fixed width (`w-[260px]`). When `isSharedPosition` is true, increase to `w-[440px]` to fit two columns comfortably.

### Change 2: Restructure shared layout (lines 405-643)

Replace the current single-column `space-y-3` layout with:

```tsx
<motion.div key="shared-layout" ...>
  {/* Two-column grid */}
  <div className="grid grid-cols-2 gap-3">
    {/* Left column: Active FTE + Expiry */}
    <div className="space-y-2">
      <div className="space-y-1.5">
        <Label>Active FTE</Label>
        <Select ...>...</Select>
      </div>
      <div className="space-y-1.5">
        <Label + info tooltip>Expiry</Label>
        <Popover + inline X clear>...</Popover>
      </div>
    </div>

    {/* Right column: Share With + Shared FTE + Shared Expiry */}
    <div className="space-y-2">
      <div className="space-y-1.5">
        <Label>Share With</Label>
        {/* Badge or cascading selects - same logic */}
      </div>
      <div className="space-y-1.5">
        <Label>Shared FTE</Label>
        <Select ...>...</Select>
      </div>
      <div className="space-y-1.5">
        <Label>Shared Expiry</Label>
        <Popover + inline X clear>...</Popover>
      </div>
    </div>
  </div>

  {/* Comment - full width below */}
  <div className="space-y-1.5">
    <Label>Comment (optional)</Label>
    <Textarea .../>
  </div>
</motion.div>
```

### Change 3: Remove the shared card wrapper

The `bg-muted/30` card around Share With and Shared FTE is no longer needed since the right column visually groups these fields. Optionally, a subtle left border or divider can separate the two columns.

## What Stays the Same

- All business logic, state, handlers, save/revert
- Cascading Market/Facility/Department selection logic and badge collapse
- Standard (non-shared) layout is completely untouched
- Calendar lazy loading and popover positioning strategy
- All field validation rules and expiry date constraints

