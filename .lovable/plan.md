

## Fix Black Vertical Line Artifacts in Forecast Two-Panel

### Problem

In the expanded Forecast detail panel (right side - "Recommended Target FTE"), each position change row displays text like `1 FTE × 1` and `= 1.0`. The multiplication sign (`×`) renders as a thin black vertical bar at the small `text-xs` font size, creating visual artifacts that look like stray pipe characters.

### Solution

Replace the `×` character with a more readable separator and clean up the row format for better readability at small sizes.

### File to Change

| File | Change |
|------|--------|
| `src/components/forecast/BalanceTwoPanel.tsx` | Update the display format in both `PositionChangeList` (line 63) and `ClosureChangeList` (line 105) components |

### Specific Changes

**Line 63** (PositionChangeList):
```
Before: <span>{change.fteValue} FTE × {change.count}</span>
After:  <span>{change.fteValue} FTE x {change.count}</span>
```

**Line 105** (ClosureChangeList):
```
Before: <span>{change.fteValue} FTE × {change.count}</span>
After:  <span>{change.fteValue} FTE x {change.count}</span>
```

Replace the Unicode multiplication sign (`×`) with a lowercase letter `x` which renders clearly at small font sizes without looking like a vertical bar.

