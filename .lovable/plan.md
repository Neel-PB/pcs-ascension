

# Compact Form Elements to Eliminate Scrolling

## Problem

The Active FTE popover form is too tall when "Shared Position" is selected, requiring scrolling. The user wants all fields visible without scrolling by reducing the height of dropdowns and date picker elements.

---

## Solution

Reduce form element heights and spacing to create a more compact layout that fits within the viewport.

### Height Reductions

| Element | Current | New |
|---------|---------|-----|
| Select triggers | `h-9` (36px) | `h-7` (28px) |
| Date picker button | `h-9` (36px) | `h-7` (28px) |
| Text input | `h-9` (36px) | `h-7` (28px) |
| Field gap | `space-y-4` (16px) | `space-y-3` (12px) |
| Label-to-input gap | `space-y-2` (8px) | `space-y-1.5` (6px) |
| Action buttons | `size="sm"` | Keep same |
| Padding | `p-4` | `p-3` |

### Visual Comparison

```text
Before (tall):                    After (compact):
+---------------------------+     +---------------------------+
|  Status / Reason          |     |  Status / Reason          |
|  [h-9 dropdown........]   |     |  [h-7 dropdown........]   |
|                           |     +---------------------------+
+---------------------------+     |  Active FTE               |
|  Active FTE               |     |  [h-7 dropdown]           |
|  [h-9 dropdown]           |     +---------------------------+
|                           |     |  Shared With              |
+---------------------------+     |  [h-7 input............]  |
|  Shared With              |     +---------------------------+
|  [h-9 input............]  |     |  Shared FTE               |
|                           |     |  [h-7 dropdown]           |
... scrolling required ...        +---------------------------+
                                  |  Shared Expiry Date       |
                                  |  [h-7 date picker]        |
                                  +---------------------------+
                                  |     [Revert]  [Save]      |
                                  +---------------------------+
```

---

## Technical Changes

| File | Change |
|------|--------|
| `src/components/editable-table/cells/EditableFTECell.tsx` | Reduce heights from `h-9` to `h-7`, tighten spacing from `space-y-4` to `space-y-3`, reduce label gap to `space-y-1.5`, reduce padding from `p-4` to `p-3` |

---

## Space Savings Calculation

| Item | Before | After | Saved |
|------|--------|-------|-------|
| 6 form fields (triggers/inputs) | 6 × 36px = 216px | 6 × 28px = 168px | 48px |
| 6 field gaps | 6 × 16px = 96px | 6 × 12px = 72px | 24px |
| 6 label gaps | 6 × 8px = 48px | 6 × 6px = 36px | 12px |
| Container padding | 32px | 24px | 8px |
| **Total saved** | | | **~92px** |

This should eliminate the need for scrolling on most viewport sizes.

---

## Expected Outcome

| Scenario | Before | After |
|----------|--------|-------|
| Shared Position (6 fields) | Requires scrolling | All fields visible |
| Other statuses (2-3 fields) | Compact | Even more compact |
| Visual density | Standard spacing | Tighter, efficient layout |

