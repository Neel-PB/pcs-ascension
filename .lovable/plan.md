
# Fix NP Settings Table Padding to Match Headers

## Problem

The NP Settings table has the same padding inconsistency that was just fixed in Volume Settings -- row cells use `px-3` while headers use `px-4`.

## Fix

**File:** `src/config/npOverrideColumns.tsx`

Update all `px-3` instances to `px-4` across the following columns:

1. **Target NP %** (line 48): `px-3` to `px-4`
2. **Max Expiration** (line 77): `px-3` to `px-4`
3. **Status** (lines 113, 124, 132, 141): all four `px-3` to `px-4`

The **Expiration Date** column uses `EditableDateCell`, which was already updated to `px-4` in the previous fix. The **Override NP %** column uses `EditableNumberCell`, which was also already updated. The **Department** column uses `TruncatedTextCell` which handles its own padding.

Total: 6 occurrences of `px-3` changed to `px-4` in one file.
