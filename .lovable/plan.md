

## Fix Screen Zooming During Forecast Tour

### Problem
When the Forecast tour guide runs, the screen appears to "zoom" or shift. Two issues cause this:

1. The `disableFlip: true` fix was applied to `OverlayTour.tsx`, but the Forecast tour actually runs through `StaffingTour.tsx` -- so tooltips can still flip to the bottom.
2. In StaffingTour's `STEP_BEFORE` callback, `scrollIntoView({ inline: 'center' })` causes horizontal scrolling that creates a zooming effect.

### File to Change

| File | Change |
|------|--------|
| `src/components/tour/StaffingTour.tsx` | Add `disableFlip: true` to `floaterProps` and change `inline: 'center'` to `inline: 'nearest'` in the scrollIntoView call |

### Specific Changes

**Line 85** -- Fix the scroll behavior that causes the zoom effect:
```
Before: el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' });
After:  el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
```

**Lines 149-151** -- Add disableFlip to prevent tooltip flipping:
```
Before:
  floaterProps={{
    disableAnimation: true,
  }}

After:
  floaterProps={{
    disableAnimation: true,
    disableFlip: true,
  }}
```

These two changes will stop the horizontal shift (zoom effect) and keep tooltips positioned on top as intended.
