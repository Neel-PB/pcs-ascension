

# Fix Expiry Column Alignment in Standard Layout

## Problem

In the standard (non-shared) layout, the "Active FTE" and "Expiry" fields sit in a `grid grid-cols-2` row. When a date is selected, a "Clear" button appears below the Expiry date picker (lines 374-383), making the right column taller than the left. This creates a visual misalignment between the two grid columns.

## Fix

Move the "Clear" action inline with the date button instead of stacking it below. This keeps both grid columns the same height regardless of whether a date is selected.

### Approach

Replace the separate "Clear" `Button` below the date picker with a small "X" icon inside the date button itself (when a date is selected). This mirrors the pattern used in the Shared Position badge (X to clear department).

**File: `src/components/editable-table/cells/EditableFTECell.tsx`**

**Change at lines 348-383** (the Expiry Popover + Clear button area):

- Remove the standalone "Clear" `Button` (lines 374-383)
- Add a small X icon inside the date `Button` that appears when `editExpiry` has a value
- The X icon calls `handleClearExpiry` with `stopPropagation` to prevent opening the calendar

**Before:**
```text
| Active FTE   | Expiry       |
| [  0.5  v]   | [Jun 30    ] |
|              | Clear         |  <-- misalignment
```

**After:**
```text
| Active FTE   | Expiry          |
| [  0.5  v]   | [Jun 30   x ]  |  <-- aligned
```

### Code Change (lines 348-383)

Replace the Popover trigger button and Clear button with:

```tsx
<div className="flex items-center gap-1">
  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "flex-1 justify-start text-left font-normal h-7 text-xs px-2",
          !editExpiry && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
        {editExpiry ? format(editExpiry, 'MMM d') : 'Date...'}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0 z-[60]" align="start">
      <Suspense fallback={...}>
        <Calendar ... />
      </Suspense>
    </PopoverContent>
  </Popover>
  {editExpiry && (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={handleClearExpiry}
    >
      <X className="h-3 w-3" />
    </Button>
  )}
</div>
```

This keeps both columns at equal height, fixing the alignment issue.

