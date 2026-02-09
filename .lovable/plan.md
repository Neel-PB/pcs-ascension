

# Align Volume Settings Cell Layouts

## Goal
Match the Override Volume and Expiration Date columns to the same visual pattern as Target Volume: content on the left, value, and action icon on the right.

---

## Current vs Target Layout

### Target Volume (reference - already correct)
```text
| [Badge: 12 Months]          42.5 |
```
Badge left, value right.

### Override Volume - Current
```text
| [Badge: Optional]  42.5  [Revert] |
```
Badge left, value + icon clustered together in the middle.

### Override Volume - Target
```text
| [Badge: Optional]     42.5  [Pencil/Revert] |
```
Badge left, value pushed right with `justify-between`, pencil/revert icon at far right.

### Expiration Date - Current
```text
| [CalendarIcon]  Mar 15, 2026 |
```
Calendar icon + text, no edit affordance.

### Expiration Date - Target
```text
| Mar 15, 2026           [Pencil/Revert] |
```
Date left-aligned (no calendar icon), pencil or revert icon on the right.

---

## Changes

### File 1: `src/components/editable-table/cells/OverrideVolumeCell.tsx`

Restructure the layout to use `justify-between`:

**Idle state** (no value set):
```text
| [Badge]                    --  [Pencil] |
```
- Badge on left
- Dash + pencil pushed to the right via `justify-between`

**Editing state** (inline input):
```text
| [Badge]           [input] [Check] [X] |
```
- Badge on left
- Input + accept/cancel on right

**Saved state** (value exists):
```text
| [Badge]                 42.5  [Revert] |
```
- Badge on left
- Value + revert icon on right

Key layout change: Wrap the entire cell in `flex items-center justify-between` so badge stays left and value+actions stay right.

### File 2: `src/components/editable-table/cells/EditableDateCell.tsx`

Remove the `CalendarIcon` from the trigger button. Add a `Pencil` icon on the right when the date is set (to indicate editability), replacing the calendar icon. Keep the revert icon logic for when the value has changed from the original.

**No date set:**
```text
| --                       [Pencil] |
```

**Date set (not changed from original):**
```text
| Mar 15, 2026             [Pencil] |
```

**Date set (changed from original):**
```text
| Mar 15, 2026            [Revert] |
```

Changes:
- Remove `CalendarIcon` import usage from the trigger
- Left-align the date text (remove `mr-2` from icon, just show text)
- Add a `Pencil` icon button on the right side that opens the calendar
- When `hasChanged()` is true, show `RotateCcw` (revert) instead of `Pencil`

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/editable-table/cells/OverrideVolumeCell.tsx` | Use `justify-between` layout: badge left, value+action right |
| `src/components/editable-table/cells/EditableDateCell.tsx` | Remove calendar icon, left-align date, add pencil/revert icon on right |

---

## Expected Outcome

All three data columns (Target Volume, Override Volume, Expiration Date) follow the same visual pattern:
- Left side: badge or value
- Right side: value and/or action icon (pencil to edit, revert to undo)
- Clean, consistent alignment across the table
