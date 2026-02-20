

## Force Forecast Tour Tooltips to Stay on Top

### Problem
Even though the Forecast tour steps have `placement: 'top'`, Joyride's underlying floater library (react-floater) automatically flips the tooltip to the bottom when it thinks there isn't enough space above the target. This is why the "Expandable Detail View" tooltip (step 3/3) appears below the table body instead of above it.

### Solution
Add `disableFlipping: true` to the `floaterProps` in `OverlayTour.tsx`. This prevents the floater from overriding the explicit `placement` set on each step.

### File to Change

| File | Change |
|------|--------|
| `src/components/tour/OverlayTour.tsx` | Add `disableFlipping: true` to the existing `floaterProps` object (line 81) |

### Specific Change (line 80-82)

```
Before:
  floaterProps={{
    disableAnimation: true,
  }}

After:
  floaterProps={{
    disableAnimation: true,
    disableFlipping: true,
  }}
```

This is a single-line addition that ensures all tour tooltips respect their configured `placement` and never auto-flip to the opposite side.

