

## Capitalize Shift Override Display in ShiftCell

### Problem
When a user manually selects "day" or "night" in the shift override popover, the value displays lowercase (e.g., "night") instead of capitalized ("Night").

### Change

**File: `src/components/editable-table/cells/ShiftCell.tsx`**

On the line displaying the override value (currently `<span className="font-medium capitalize shrink-0">{selectedDayNight}</span>`), the `capitalize` CSS class should handle this — but the `SelectItem` values are lowercase `"day"` and `"night"`. The `capitalize` class only capitalizes the first letter via CSS `text-transform`, which should work. However, to be safe and consistent across all rendering contexts, explicitly capitalize the displayed text:

Change the override display span (~line 100):
```tsx
// Current
<span className="font-medium capitalize shrink-0">{selectedDayNight}</span>

// Updated — explicit JS capitalization, remove CSS capitalize
<span className="font-medium shrink-0">
  {selectedDayNight ? selectedDayNight.charAt(0).toUpperCase() + selectedDayNight.slice(1) : ''}
</span>
```

This ensures "day" → "Day" and "night" → "Night" regardless of CSS support or context. Single-line change, UI-only.

