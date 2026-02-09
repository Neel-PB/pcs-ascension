

# Apply Content-Left / Action-Right Layout to NP Override Column

## Problem
The **Override NP %** column in the NP Settings tab currently uses `EditableNumberCell`, which renders the value as a centered button. This is inconsistent with the Volume Settings tab, where the Override Volume column uses the `OverrideVolumeCell` component with a structured left-right layout (value on the left, pencil/revert icons on the right).

## Solution
Update the `EditableNumberCell` component's non-editing (display) state to use a `flex justify-between` layout instead of centered text. This aligns with the pattern used throughout the settings tables.

### Changes to `src/components/editable-table/cells/EditableNumberCell.tsx`

**Display state (non-editing):** Change from a centered `<button>` to a `flex justify-between` layout:
- **Left side**: The number value (or dash placeholder)
- **Right side**: Pencil icon to enter edit mode (or RotateCcw revert icon when modified)

The editing state (inline input) remains unchanged.

```text
Before:  |        10        |   (centered, no icon)
After:   | 10          [pen]|   (value left, icon right)
```

### Specific changes:

1. Replace the `<button>` wrapper with a `<div>` using `flex items-center justify-between w-full h-full px-3`
2. Place the value `<span>` as the first flex child (left-aligned)
3. Add a `Pencil` icon button as the second flex child (right-aligned) for the idle state
4. When `isModified`, show `RotateCcw` instead of `Pencil` on the right
5. Clicking the value area or pencil enters edit mode

## Files to Modify

| File | Change |
|------|--------|
| `src/components/editable-table/cells/EditableNumberCell.tsx` | Restructure display state to `justify-between` with value-left and pencil/revert icon-right |
