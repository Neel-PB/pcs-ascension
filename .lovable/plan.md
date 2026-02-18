

## Fix: Match cell spacing to header layout pattern

### Problem
The header uses `flex items-center gap-2` where the label has `flex-1` and icons sit naturally after it. The cells use `justify-between`, which pushes the pencil icon all the way to the right edge of the cell -- creating a large visual gap between the value and the icon that doesn't match the header spacing.

### Solution
Remove `justify-between` from the cell buttons and instead give the value span `flex-1`, so the icon sits right after the value with only `gap-2` spacing -- exactly like the header does.

### Technical Details

**1. `src/components/editable-table/cells/EditableFTECell.tsx` (line 258)**

Change:
```
"flex items-center justify-between gap-2"
```
To:
```
"flex items-center gap-2"
```

And on line 264, add `flex-1` to the value span:
```
Before: <span>{value != null ? value : '—'}</span>
After:  <span className="flex-1">{value != null ? value : '—'}</span>
```

**2. `src/components/editable-table/cells/ShiftCell.tsx` (line ~96)**

Change the special shift button from:
```
"flex items-center justify-between gap-2"
```
To:
```
"flex items-center gap-2"
```

And add `flex-1 min-w-0` to both the modified and unmodified value spans so the icon sits naturally adjacent with `gap-2` spacing.

### Result
The value will left-align and take up available space via `flex-1`, while the pencil/revert icon will sit immediately after with a consistent `gap-2` (8px) -- matching the header's label-to-chevron spacing exactly.
