

# Remove "Optional" Badge from Override NP % Column

## Change

Make the `badge` prop optional in `OverrideVolumeCell` and skip rendering it when not provided. Then remove the badge config from the NP Override column.

## Files

### 1. `src/components/editable-table/cells/OverrideVolumeCell.tsx`
- Make `badge` prop optional in the interface
- Wrap the badge JSX block (lines 106-116) in a conditional: only render when `badge` is provided
- This keeps Volume Settings working unchanged since it still passes a badge

### 2. `src/config/npOverrideColumns.tsx`
- Remove the `badge` object from the `OverrideVolumeCell` usage in the Override NP % column (lines 77-82)

## Result

The Override NP % column will show just the value and edit controls without the "Optional" badge, while Volume Settings retains its existing badges.
