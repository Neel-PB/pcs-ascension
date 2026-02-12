

## Fix Pencil and Revert Icons to Use Outlined Style

### Problem
The pencil (edit) and revert (undo) icons in Volume Settings and NP Settings use **filled** Material Design icons (`MdEdit`, `MdUndo`), which look visually heavier than the outlined icons used elsewhere in the app (sidebar, navigation). This creates an inconsistent look.

### Fix

**File: `src/lib/icons.ts`**

Update two icon mappings from filled to outlined variants:

| Icon Name | Current (Filled) | Updated (Outlined) |
|---|---|---|
| `Pencil` | `MdEdit` | `MdOutlineEdit` |
| `RotateCcw` | `MdUndo` | `MdOutlineUndo` |

This is a global change that affects all cells using these icons (OverrideVolumeCell, EditableDateCell, EditableNumberCell, EditableFTECell, ShiftCell, etc.), bringing them all into alignment with the outlined icon style used in the sidebar and other UI elements.

### Also update related Edit aliases
`Edit` and `Edit2` also map to `MdEdit` -- these should be updated to `MdOutlineEdit` as well for full consistency.

### Scope
- Single file change: `src/lib/icons.ts` (4 icon mappings)
- No component changes needed -- all components import from `@/lib/icons`
