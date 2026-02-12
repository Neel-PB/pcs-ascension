

## Match Action Button Heights to Toggle Heights

### Goal
Reduce the height of the three action buttons (Refresh, Download, Fullscreen) in the Planned/Active Resources header bar so they visually match the height of the Hired/Active and Nursing/Non-Nursing toggles.

### Current State
- The action buttons use `size="icon"` which renders as `h-10 w-10` (40px) -- taller than the toggles
- The toggles are approximately 30-32px tall (border-2 + p-1 + py-1 content)
- Icons inside the buttons are `h-4 w-4` (16px)

### Changes

**File: `src/pages/staffing/PositionPlanning.tsx`**

1. **Refresh button** (DataRefreshButton, line 932): The DataRefreshButton component hardcodes `size="icon"` internally, so we need to pass a className override to reduce its size to `h-8 w-8` (32px)

2. **Download button** (line 933-941): Change from `size="icon"` to `size="icon"` with explicit className `h-8 w-8` override, and keep icon at `h-4 w-4`

3. **Fullscreen button** (line 942-950): Same treatment -- add `h-8 w-8` className override

**File: `src/components/dashboard/DataRefreshButton.tsx`**

4. **DataRefreshButton** (line 88-100): Accept an optional `className` prop and pass it through to the inner Button, so the parent can control the size

### Technical Details
- Adding `className` passthrough to `DataRefreshButton` keeps it reusable while allowing the staffing header to shrink it
- The `h-8 w-8` (32px) size will closely match the toggle pill height (~30-32px with border + padding)
- Icons remain at `h-4 w-4` for readability at this size

### Files Modified

| File | Change |
|---|---|
| `src/pages/staffing/PositionPlanning.tsx` | Add `h-8 w-8` className to Download and Fullscreen buttons, pass className to DataRefreshButton |
| `src/components/dashboard/DataRefreshButton.tsx` | Accept and forward optional `className` prop to inner Button |

