

# Fix Expiration Date Spacing

## Problem
The wrapping `<div className="relative">` in `volumeOverrideColumns.tsx` (line 156) does not have `w-full h-full`, so the `EditableDateCell` inside it cannot stretch to fill the cell width. This causes the date and pencil icon to stay clustered together.

## Fix

**File: `src/config/volumeOverrideColumns.tsx` (line 156)**

Change:
```tsx
<div className="relative">
```
To:
```tsx
<div className="relative w-full h-full">
```

This ensures the wrapper fills the entire table cell, allowing the inner `flex justify-between` in `EditableDateCell` to push the date to the left edge and the pencil icon to the right edge.

## Files to Modify

| File | Change |
|------|--------|
| `src/config/volumeOverrideColumns.tsx` | Add `w-full h-full` to the wrapper div on line 156 |
