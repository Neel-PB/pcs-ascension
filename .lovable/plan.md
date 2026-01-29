

# Widen Popover with Two-Column Layout for Shared Position

## Problem

The current Active FTE popover uses a narrow single-column layout (320px). When "Shared Position" is selected, 6 fields are stacked vertically, making the form too tall for the viewport. The user wants all fields visible at once without scrolling.

---

## Solution

Use a wider popover with a two-column grid layout when "Shared Position" is selected. This keeps all fields visible within the viewport.

### Layout Strategy

| Status | Width | Layout |
|--------|-------|--------|
| Any non-shared status | 320px (`w-80`) | Single column (3 fields max) |
| Shared Position | 560px (`w-[560px]`) | Two-column grid |

### Two-Column Grid for Shared Position

```text
+---------------------------+---------------------------+
|  Status / Reason          |  Active FTE               |
|  [Dropdown.............]  |  [Dropdown..]             |
+---------------------------+---------------------------+
|  Shared With              |  Shared FTE               |
|  [Input field...........]  |  [Dropdown..]             |
+---------------------------+---------------------------+
|  Shared Expiry Date       |                           |
|  [Date picker...........]  |        [Save] [Revert]   |
+---------------------------+---------------------------+
```

---

## Technical Changes

| File | Change |
|------|--------|
| `src/components/editable-table/cells/EditableFTECell.tsx` | Dynamic width based on status; two-column grid layout for Shared Position |

---

## Implementation Details

1. **Dynamic popover width**: 
   - Default: `w-80` (320px)
   - Shared Position: `w-[560px]`

2. **Grid layout for Shared Position**:
   - Use `grid grid-cols-2 gap-4` for the form container
   - Fields arranged in logical pairs (Status + FTE, Shared With + Shared FTE)
   - Action buttons span full width at the bottom

3. **Single-column for other statuses**:
   - Keep existing vertical stack layout
   - No change to current behavior

4. **Remove scroll wrapper**:
   - Since all fields fit, scrolling is no longer needed
   - Remove the max-height constraint

---

## Expected Outcome

| Scenario | Before | After |
|----------|--------|-------|
| Shared Position | Tall form with clipped Save button | Compact two-column layout, all fields visible |
| Other statuses | 3-field vertical form | Same compact vertical form |
| Viewport space | Scrolling required | No scrolling needed |

