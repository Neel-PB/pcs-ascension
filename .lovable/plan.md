

## Fix Table Height to Prevent Page Scroll

### Problem
The Planned/Active Resources, Variance Analysis, and Forecast tables all use a fixed `max-h-[600px]` constraint. When the viewport isn't tall enough to fit the filters + tabs + KPI cards + 600px table, the outer page scrolls as well, instead of only the table scrolling internally.

### Solution
Replace the fixed `max-h-[600px]` with a viewport-relative calculation that accounts for the space consumed by elements above the table (header, filters, tab bar, section headers/KPIs).

### Files to Change

| File | Current | New |
|------|---------|-----|
| `src/components/forecast/ForecastBalanceTable.tsx` (line 36) | `max-h-[600px]` | `max-h-[calc(100vh-var(--header-height)-300px)]` |
| `src/pages/staffing/VarianceAnalysis.tsx` (line 723) | `max-h-[600px]` | `max-h-[calc(100vh-var(--header-height)-240px)]` |
| `src/pages/staffing/PositionPlanning.tsx` (line 533) | `max-h-[600px]` | `max-h-[calc(100vh-var(--header-height)-240px)]` |

### Why Different Values
- **Forecast** uses 300px offset because it has taller KPI cards above the table.
- **Variance and Planning** use 240px offset because they have a simpler section header above the table.

The `var(--header-height)` CSS variable is already defined in the shell layout, so the calculation automatically adapts to the header size. This ensures the table fills the remaining viewport space and scrolls internally, while the page itself never scrolls.
