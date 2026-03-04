

## Fix: Column Widths Not Applying Due to Cached Store

### Root Cause
The `useColumnStore` uses Zustand's `persist` middleware with `version: 4`. When `initializeColumns` runs, it skips updating existing columns — it only adds brand-new ones. So the old narrower widths (from before the recent changes) are stuck in localStorage and override the column definitions.

### Fix

**1. Bump store version** (`src/stores/useColumnStore.ts`)
- Change `version: 4` → `version: 5`
- This forces a full re-initialization with the correct widths from column definitions

**2. Update `initializeColumns` to sync widths** (`src/stores/useColumnStore.ts`)
- When existing columns are found, update their `width` property from the new defaults so future config changes always take effect without needing version bumps

### Files Changed
- `src/stores/useColumnStore.ts` — bump version to 5, update merge logic to sync widths from definitions

