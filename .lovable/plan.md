
# Fix NP Settings Padding -- EditableNumberCell Still Uses px-3

## Problem

The `EditableNumberCell` component (used by the "Override NP %" column) still has `px-3` padding on line 87, while all headers and other cells now use `px-4`. This was missed in the earlier round of padding fixes.

## Fix

**File:** `src/components/editable-table/cells/EditableNumberCell.tsx`

Two lines need updating:

1. **Line 69** (editing state): `px-4` -- already correct
2. **Line 87** (display state): Change `px-3` to `px-4`

```tsx
// Before (line 87)
"flex items-center justify-between w-full h-full px-3",

// After
"flex items-center justify-between w-full h-full px-4",
```

This is the same one-line fix pattern used for the other cells. It affects both the NP Settings and Volume Settings Override columns since they share this component.
