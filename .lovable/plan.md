

## Fix "More Filters" Chevron Color and Animation

### Problem
The "More Filters" dropdown button chevron icon is missing:
1. The blue color (`text-[#1D69D2]`) used by the Facility and Department chevrons
2. The rotation animation (`transition-transform duration-200` with `rotate-180` when open)

### Fix

**File: `src/components/staffing/CombinedOptionalFilters.tsx`**

The DropdownMenu does not expose an `open` state by default, so we need to add state tracking.

1. **Add state**: Import `useState` and track `open` state via the `onOpenChange` prop of `DropdownMenu`.
2. **Update ChevronDown** (line 60): Change from `className="h-4 w-4 ml-1"` to `className="h-4 w-4 ml-1 text-[#1D69D2] transition-transform duration-200 ${open ? 'rotate-180' : ''}"` to match the Facility/Department chevron styling.

### Technical Details

- Line 1: Add `useState` import
- Line 47: Change `<DropdownMenu>` to `<DropdownMenu open={open} onOpenChange={setOpen}>`
- Line 60: Update `ChevronDown` className to include blue color and rotation animation

This ensures the "More Filters" chevron matches the visual behavior of all other filter chevrons in the FilterBar.

