

## Add Rounded Corners to Select Trigger Buttons

### Problem
The Select trigger buttons (the rectangular inputs you click to open filter dropdowns) currently use `rounded-sm` which gives them very subtle corners. The user wants visibly rounded corners on these triggers.

### Changes

**File: `src/components/ui/select.tsx`**
- `SelectTrigger`: Change `rounded-sm` to `rounded-lg` in the default className

This single change will update every Select trigger globally -- all filters on Staffing, Positions, and other pages.

### What stays the same
- Dropdown content panels (already updated to `rounded-lg` in previous change)
- Individual menu items remain flush/rectangular
- All padding, sizing, colors, focus states unchanged

