

## Fix: Left-align values with icons on the right for Hired FTE, Active FTE, and Shift columns

### Problem
Currently, Hired FTE and Active FTE values are center-aligned. The user wants all three columns to follow a consistent layout: **value on the left, icon (pencil/revert) on the right**.

### Changes

**1. `src/components/editable-table/cells/NumberCell.tsx` (Hired FTE)**
- Remove `text-center` from the CellButton className so the value renders left-aligned (CellButton already defaults to `text-left`).

```
Before: className={cn("text-center font-medium", className)}
After:  className={cn("font-medium", className)}
```

**2. `src/components/editable-table/cells/EditableFTECell.tsx` (Active FTE)**
- Change the trigger button from `text-center` to `text-left` so the value sits on the left.
- Change the value `<span>` from `block` (which centers in a text-center parent) to an inline span, and use flexbox layout to position value left and icon right without absolute positioning.

Line 252-275 becomes:
```tsx
<button
  className={cn(
    "w-full h-full text-left px-4 py-2",
    "text-sm font-medium",
    "hover:bg-muted/50 transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "flex items-center justify-between",
    isModified && "text-primary",
    className
  )}
  type="button"
>
  <span>{value != null ? value : '...'}</span>
  {isModified ? (
    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0" onClick={handleRevert} />
  ) : (
    <Pencil className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
  )}
</button>
```

Key change: Replaced `text-center` + absolute icon positioning with `flex items-center justify-between` for a clean left-value, right-icon layout.

**3. `src/components/editable-table/cells/ShiftCell.tsx` (Shift)**
- Already uses left-aligned text with icon on the right for special shifts -- no change needed there.
- For normal (non-special) shifts, the value is left-aligned via CellButton -- already correct.

### Summary
Two files changed, one file unchanged. The result will be a consistent layout across all three columns matching the reference image.
