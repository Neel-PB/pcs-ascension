

## Center-Align KPI Cards When Fewer Than 6

### Problem
When a KPI section (e.g., Volume) has fewer than 6 cards, they left-align in the 6-column grid, leaving empty space on the right. The user wants cards centered within the row while keeping the section title (e.g., "Volume") left-aligned.

### Solution
Conditionally switch the KPI container layout in `DraggableKPISection.tsx`:
- When there are 6 or more KPIs: keep the current `grid grid-cols-6` layout
- When there are fewer than 6 KPIs: use `flex flex-wrap justify-center` so cards center naturally

### File Changes

| File | Change |
|------|--------|
| `src/components/staffing/DraggableKPISection.tsx` | On line 75, conditionally apply `flex flex-wrap justify-center gap-4` when `kpis.length < 6`, otherwise keep `grid grid-cols-6`. Each card in flex mode gets a fixed width matching the grid column width for visual consistency. |

### Technical Details

**DraggableKPISection.tsx (line 75)**

Current:
```tsx
<div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
```

Updated:
```tsx
<div className={cn(
  "gap-4",
  kpis.length < 6
    ? "flex flex-wrap justify-center"
    : "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
)}>
```

For flex mode, each `KPICard` wrapper needs a consistent width. We add a wrapper div with a style like `flex: 0 0 calc((100% - 5 * 16px) / 6)` to match the grid column sizing, ensuring cards are the same width as in a full 6-column row but centered.

The section title and drag handle remain left-aligned as they are outside the card container. The breakdown badges row (lines 90-176) only renders when there are exactly 6 FTE KPIs, so it remains unaffected.

