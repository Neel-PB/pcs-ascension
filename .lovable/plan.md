
# Fix Expiration Date Cell Padding

## Problem

The Expiration Date column's cell content uses `px-3` padding while all other columns were updated to `px-4`, causing misalignment.

## Fix

**File:** `src/components/editable-table/cells/EditableDateCell.tsx` (line 87)

Change `px-3` to `px-4`:

```tsx
// Before
<div className="flex items-center justify-between w-full h-full px-3">

// After
<div className="flex items-center justify-between w-full h-full px-4">
```

Single-line change to match the padding standard across all Volume Settings columns.
