

# Make Override NP % Match Expiration Date Cell Layout

## Problem

The "Override NP %" column currently uses `OverrideVolumeCell` which has a different interaction pattern (inline input with check/X buttons). The user wants it to match the "Expiration Date" column's clean layout from `EditableDateCell`: value on the left, single pencil icon on the right, with a popover for editing.

## Approach

Create a new cell component `EditableNumberPopoverCell` that mirrors `EditableDateCell` but uses a number input inside a Popover instead of a Calendar. This gives the same visual pattern:

- Idle: dash on left, pencil icon on right
- Has value: formatted value on left, pencil (or revert) icon on right  
- Click pencil: opens a popover with number input
- Revert: clears the override

## Files to Change

### 1. New File: `src/components/editable-table/cells/EditableNumberPopoverCell.tsx`

Create a component matching `EditableDateCell`'s structure:
- Same `flex items-center justify-between w-full h-full px-4` wrapper
- Value or dash on the left
- Pencil button on the right (opens Popover with number input)
- RotateCcw button when value is set (to revert/delete)
- Support `autoOpen` and `onAutoOpenComplete` props (for staged save flow)

### 2. Update: `src/config/npOverrideColumns.tsx`

Replace `OverrideVolumeCell` with the new `EditableNumberPopoverCell` in the "Override NP %" column. Pass the same `onSave`, `onDelete`, `isPending`, and auto-open props.

## Result

The "Override NP %" and "Expiration Date" columns will have identical visual patterns: clean value-left, icon-right layout with popover-based editing.
