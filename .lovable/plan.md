

## Fix: Two horizontal scrollbars in Employee and Contractor tables

### Root Cause
There are two nested elements with `overflow-x-auto`:
1. **Parent container** in `EditableTable.tsx` (line 247): `overflow-x-auto`
2. **VirtualizedTableBody** (line 41): `overflow-x-auto` (added in the previous fix)

Both create their own horizontal scrollbar, resulting in two visible scrollbars.

### Solution
Remove `overflow-x-auto` from the `VirtualizedTableBody` container and let the parent in `EditableTable.tsx` handle all horizontal scrolling. The body should only scroll vertically.

**File: `src/components/editable-table/VirtualizedTableBody.tsx`** (line 41):
```tsx
// Before
className="flex-1 min-h-0 overflow-y-auto overflow-x-auto overscroll-contain"

// After
className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
```

The parent container in `EditableTable.tsx` already has `overflow-x-auto`, which handles horizontal scrolling for both the header and body together. This also keeps them in sync (no separate horizontal scroll contexts).

