

## Fix Column Order Not Matching Specifications

### Problem
The column definitions in code are in the correct order, but the UI shows columns in a different order (e.g., Hired FTE appearing last in Open Reqs). This is because the `useColumnStore` persists column order/visibility in localStorage. Once a user has visited a tab, the old column order is saved and never overwritten by new code changes.

### Root Cause
`src/stores/useColumnStore.ts` uses `persist` middleware with `version: 3`. The `initializeColumns` function preserves existing stored order and only appends new columns. So even though column configs were reordered in code, the browser keeps showing the old arrangement.

### Fix
Bump the store version from `3` to `4` in `src/stores/useColumnStore.ts`. This invalidates the cached column state in all browsers and forces a fresh initialization from the current column definitions.

### File Modified
- `src/stores/useColumnStore.ts` -- change `version: 3` to `version: 4` (line 105)

