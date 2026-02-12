

## Fix: Date Picker Not Opening on Pencil Click

### Root Cause

The `PopoverTrigger asChild` requires its child to accept a `ref` (via `React.forwardRef`). The `Pencil` icon is mapped to `MdOutlineEdit` from `react-icons`, which is a plain function component that does **not** support refs. This is confirmed by the console error:

> "Function components cannot be given refs... Check the render method of `Primitive.button.SlotClone`"

Because the ref fails silently, the popover never anchors and never opens.

### Fix

**File: `src/components/editable-table/cells/EditableDateCell.tsx`** (line 117-119)

Wrap the `Pencil` icon inside a `<span>` element so the `PopoverTrigger asChild` can attach its ref to the native DOM element:

```tsx
// FROM:
<PopoverTrigger asChild>
  <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
</PopoverTrigger>

// TO:
<PopoverTrigger asChild>
  <span className="inline-flex cursor-pointer">
    <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
  </span>
</PopoverTrigger>
```

This is a single 3-line change. No other files need updating -- the Volume Settings and NP Settings both use this same `EditableDateCell` component.
