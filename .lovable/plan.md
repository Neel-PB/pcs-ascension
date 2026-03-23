

## Simplify Target Volume Popover: Chart Only

### What
Strip the `TargetVolumePopover` down to just the chart and legend. Remove the spread percentage indicator, calculation detail cards (N-Mo Avg vs 3-Mo Low), and reasoning text below the separator.

### Changes

#### `src/components/staffing/TargetVolumePopover.tsx`
- **Remove lines 232-290**: Everything after the legend — the `<Separator>`, the calculation details grid (N-Mo Avg / 3-Mo Low cards), spread indicator, and reasoning text
- **Remove unused imports**: `Separator`, `Check` (if only used in removed section)
- **Remove unused props from interface & destructure**: `spreadPercentage`, `usedThreeMonthLow`, `spreadThreshold` — keep only what the chart needs (`historicalMonthsData`, `historicalMonthsCount`, `targetVolume`, `minMonthsForTarget`, `threeMonthLowAvg`, `nMonthAvg`, `lowestThreeMonths`)
- The chart with reference lines (N-mo avg dashed line, 3-mo low dashed line), highlighted lowest-3 dots, and the legend all stay as-is

### Files Changed
- `src/components/staffing/TargetVolumePopover.tsx`

