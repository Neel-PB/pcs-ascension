

## Fix: Tour exit causes layout shift in Positions module

### Problem
When the Positions tour finishes or is skipped, the table appears shifted because:

1. During the tour, `scrollIntoView({ inline: 'center' })` horizontally scrolls the table container to center targets like Active FTE and Shift cells
2. On tour completion, only vertical scroll is reset -- the horizontal scroll on the table container (`overflow-x-auto`) is never restored
3. The selector `[class*="overflow-y-auto"]` used in cleanup doesn't match the main shell container (which uses `overflow-y-scroll`)

### Changes

**`src/components/tour/PositionsTour.tsx`** -- Fix the `handleCallback` cleanup logic:

1. On `STATUS.FINISHED` or `STATUS.SKIPPED`, also reset horizontal scroll on the table container by querying `[class*="overflow-x-auto"]` and setting `scrollLeft: 0`
2. Fix the main container selector to target `main` directly (already done) instead of relying on `[class*="overflow-y-auto"]` which doesn't match `overflow-y-scroll`
3. Also reset horizontal scroll after each `scrollIntoView` step to prevent mid-tour layout drift

### Technical Detail

The completion handler will become:

```
if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
  // Reset vertical scroll
  const mainContainer = document.querySelector('main');
  if (mainContainer) {
    mainContainer.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Reset horizontal scroll on table container
  const tableContainer = document.querySelector('[class*="overflow-x-auto"]');
  if (tableContainer) {
    tableContainer.scrollTo({ left: 0, behavior: 'instant' });
  }

  completeTour();
}
```

The step handler will also be updated to avoid `inline: 'center'` which causes horizontal scroll shifts -- changing to `inline: 'nearest'` or removing the `scrollIntoView` call for cell-level targets and only scrolling the main container vertically.

### Result
Exiting the tour (skip or finish) will fully restore scroll position, preventing any layout shift.
