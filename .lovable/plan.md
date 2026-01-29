

# Revert to Single-Column Layout for Shared Position

## Problem

The two-column grid layout looks odd. The user prefers a consistent single-column layout for both Shared Position and other statuses.

---

## Solution

Revert to a single-column layout for all statuses, with a scrollable container using the Radix `--radix-popper-available-height` CSS variable to ensure all fields remain accessible.

### Layout

```text
+--------------------------------+
|  Status / Reason               |
|  [Dropdown...................]  |
+--------------------------------+
|  Active FTE                    |
|  [Dropdown..]                  |
+--------------------------------+
|  Shared With                   |
|  [Input field................]  |
+--------------------------------+
|  Shared FTE                    |
|  [Dropdown..]                  |
+--------------------------------+
|  Shared Expiry Date            |
|  [Date picker................]  |
+--------------------------------+
|       [Revert]  [Save]         |
+--------------------------------+
```

---

## Technical Changes

| File | Change |
|------|--------|
| `src/components/editable-table/cells/EditableFTECell.tsx` | Remove two-column grid; use single unified layout with dynamic scroll height |

---

## Implementation Details

1. **Unified single-column layout**: Use the same `space-y-4` vertical stack for all statuses
2. **Dynamic scroll container**: Wrap content in a scrollable div with `max-height: calc(var(--radix-popper-available-height, 70vh) - 20px)`
3. **Consistent width**: Keep `w-80` (320px) for all cases
4. **Conditional fields**: Show Shared With, Shared FTE, and Shared Expiry fields only when status is "Shared Position"

---

## Expected Outcome

| Scenario | Before | After |
|----------|--------|-------|
| Shared Position | Wide two-column grid | Consistent single-column layout |
| Form height exceeds viewport | Content clips | Scrollable within available space |
| Visual consistency | Different layouts per status | Same layout pattern for all |

