

# Align Override NP % Cell Layout to Match Expiration Date

## Problem

The `OverrideVolumeCell` groups the dash and pencil icon together on the right side of the cell. The user wants it to match `EditableDateCell`'s layout: **dash on the left, pencil icon on the right**, with `justify-between` spacing.

## Change

### `src/components/editable-table/cells/OverrideVolumeCell.tsx`

Restructure the idle and saved states to use the same layout as `EditableDateCell`:

**Idle state** (no value):
- Left: dash (`—`) with optional warning icon
- Right: Pencil button

**Editing state** (inline input):
- Left: number input
- Right: Check and X buttons

**Saved state** (has value):
- Left: value text
- Right: Revert button (when not pending)

The wrapper will change from the current two-section layout (badge left, value area right) to a single `flex items-center justify-between w-full h-full px-4` pattern, removing the nested `flex items-center gap-1` grouping so items spread across the full width.

