

# Apply Same Expiration Date Layout Fix to NP Settings

## Problem
The NP Settings tab has the same issue as Volume Settings: the Expiration Date column wraps `EditableDateCell` in a `<div className="px-3 py-2">` that doesn't fill the cell, causing the date and pencil icon to cluster together.

## Fix

**File: `src/config/npOverrideColumns.tsx` (line 92)**

Change:
```tsx
<div className="px-3 py-2">
```
To:
```tsx
<div className="relative w-full h-full">
```

This matches the fix applied to `volumeOverrideColumns.tsx`, allowing the `EditableDateCell` to stretch across the full cell width so `justify-between` pushes the date left and the pencil icon right.

## Files to Modify

| File | Change |
|------|--------|
| `src/config/npOverrideColumns.tsx` | Replace `px-3 py-2` with `relative w-full h-full` on the wrapper div (line 92) |

