

## Fix: Department Section Not Visible in Access Scope Dialog

### Root Cause
The `ScrollArea` (line 177) has `className="flex-1 px-6"` but Radix ScrollArea needs an explicit height constraint to actually scroll. With `flex-1` inside a `flex flex-col` container capped at `max-h-[90vh]`, the ScrollArea viewport doesn't properly constrain, so content beyond the visible area (Department section) gets clipped without a scrollbar appearing.

### Fix: `src/components/admin/AccessScopeDialog.tsx`

1. **Line 177** — Add `overflow-hidden` to the ScrollArea wrapper and ensure it can shrink: change `flex-1 px-6` to `flex-1 min-h-0 px-6`. The `min-h-0` is critical — it allows the flex child to shrink below its content size, enabling the Radix ScrollArea viewport to activate scrolling.

Single line change:
```tsx
// Before
<ScrollArea className="flex-1 px-6">

// After  
<ScrollArea className="flex-1 min-h-0 px-6">
```

This is a classic flexbox issue: flex children default to `min-height: auto` which prevents them from shrinking below content size, breaking scroll containers.

