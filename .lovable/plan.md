

# Fix Filter Bar Position Shifting Between Tabs

## Problem

When switching between tabs (e.g., Summary to Forecast or Volume Settings), the filters shift slightly in position. This happens because:

1. The `main` content area uses `overflow-auto`, meaning the vertical scrollbar appears/disappears based on content height
2. The FilterBar uses `justify-center`, so when the scrollbar disappears (shorter content), the available width increases by ~15px, causing all centered filters to shift right

## Fix

**File:** `src/components/shell/ShellLayout.tsx` (line 43)

Add `overflow-y: scroll` to the main content area so the scrollbar is always present, preventing width changes:

```
className="px-4 py-4 bg-shell-elevated overflow-auto"
```
becomes:
```
className="px-4 py-4 bg-shell-elevated overflow-y-scroll overflow-x-hidden"
```

This ensures the scrollbar gutter is always reserved, so the content width stays constant regardless of which tab is active. The filters will no longer shift when switching between tabs.

