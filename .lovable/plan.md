
# Fix Expiration Date: Separate Date Text and Pencil Icon

## Problem
The date text and pencil icon are clustered together because the `Popover` component wraps the trigger button, making it a single flex child alongside the text span. The `justify-between` doesn't push them apart effectively.

## Fix
Restructure the component so the `Popover` wraps the entire cell (not just the icon), keeping the date `span` and the trigger `Button` as direct flex children within the `justify-between` container.

### File: `src/components/editable-table/cells/EditableDateCell.tsx`

Move `Popover` to wrap the outer container. The layout becomes:

```text
<Popover>
  <div className="flex items-center justify-between w-full h-full px-3">
    <span>Mar 09, 2026</span>              <!-- left -->
    <PopoverTrigger asChild>
      <Button>[Pencil/Revert]</Button>      <!-- right -->
    </PopoverTrigger>
  </div>
  <PopoverContent>...</PopoverContent>
</Popover>
```

This ensures the span and button are direct siblings in a `justify-between` flex container, pushing the date to the left edge and the icon to the right edge.

The revert button logic remains: when `hasChanged()` is true, show `RotateCcw` (which reverts on click and stops propagation to prevent opening the popover); otherwise show `Pencil` (which opens the calendar).

## Files to Modify

| File | Change |
|------|--------|
| `src/components/editable-table/cells/EditableDateCell.tsx` | Move Popover to wrap outer div; keep span and PopoverTrigger as direct flex siblings |
