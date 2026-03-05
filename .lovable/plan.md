

## Fix: Vertically Center Name and ID in Facility & Department Dropdowns

### Problem
In the Facility and Department combobox dropdowns in the FilterBar, the name (left column) and ID (right column) are not vertically centered relative to each other. The grid layout lacks `items-center` alignment.

### Solution
Add `items-center` to the grid container `div` in both the Facility and Department `CommandItem` renderers in `src/components/staffing/FilterBar.tsx`.

**File: `src/components/staffing/FilterBar.tsx`**

1. **Facility items (line ~412)**: Change `grid grid-cols-[minmax(0,1fr)_80px] w-full` to `grid grid-cols-[minmax(0,1fr)_80px] w-full items-center`

2. **Department items (line ~502)**: Same change — add `items-center` to the grid container class.

Two lines changed total. No other files affected.

