

## Fix: Horizontal scrolling broken in EditableTable

### Root Cause
In `src/components/editable-table/VirtualizedTableBody.tsx` (line 41), the scroll container has `overflow-x-hidden`, which explicitly prevents horizontal scrolling. The horizontal scroll is supposed to be handled by the parent container in `EditableTable.tsx`, but the `VirtualizedTableBody` is the actual scroll element for virtualization — so horizontal overflow inside it is clipped.

### Solution
**File: `src/components/editable-table/VirtualizedTableBody.tsx`** — Change `overflow-x-hidden` to `overflow-x-auto` on line 41:

```tsx
// Before
className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"

// After  
className="flex-1 min-h-0 overflow-y-auto overflow-x-auto overscroll-contain"
```

This single change allows the virtualized body to scroll horizontally in sync with the header (which is inside the same `overflow-x-auto` parent container in `EditableTable.tsx`). All five position tabs use the same `EditableTable` component, so this fix applies everywhere.

