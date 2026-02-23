

## Fix: Expanded Row Causing Unnecessary Horizontal Scroll in Forecast Table

### Problem

The Forecast Balance Table wraps all content in a `min-width: max-content` container to support horizontal scrolling for the column headers. When a row is expanded, the `BalanceTwoPanel` (two-panel detail view) inherits this min-width, stretching wider than the viewport and introducing a horizontal scrollbar that isn't present when rows are collapsed.

### Solution

Make the expanded content "break out" of the `min-width: max-content` context by using `sticky left-0` positioning combined with a viewport-relative width. This keeps the expanded panel pinned to the visible area regardless of the horizontal scroll state of the table.

### Technical Details

**File: `src/components/forecast/ForecastBalanceTableRow.tsx` (line 74)**

Change the expanded content wrapper from:
```tsx
<div className="bg-muted/20 px-6 py-4 border-t">
```

To:
```tsx
<div className="bg-muted/20 px-6 py-4 border-t sticky left-0 w-[calc(100vw-var(--sidebar-width,80px)-48px)]">
```

However, using CSS variables for sidebar width can be fragile. A simpler and more robust approach is to use `max-w-[calc(100vw-120px)]` to cap the panel width to the viewport minus approximate sidebar width, preventing it from stretching with the grid.

The cleanest approach: wrap the expanded content in a container that uses `sticky left-0` so it stays in view, and give it a sensible max-width so the two-panel layout doesn't stretch beyond the visible area.

**Change in `ForecastBalanceTableRow.tsx` line 74:**
```tsx
// Before:
<div className="bg-muted/20 px-6 py-4 border-t">

// After:
<div className="bg-muted/20 px-6 py-4 border-t sticky left-0 overflow-hidden" style={{ width: 'calc(100vw - 120px)' }}>
```

This single-line change ensures:
- `sticky left-0`: The expanded panel stays pinned to the left edge of the scroll container
- `width: calc(100vw - 120px)`: Constrains the panel to the visible viewport width (minus sidebar)
- `overflow-hidden`: Prevents any child content from overflowing

### Scope
- Single file: `src/components/forecast/ForecastBalanceTableRow.tsx`
- One line change (line 74)
