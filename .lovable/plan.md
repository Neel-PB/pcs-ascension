

## Fix: OverlayTour Missing Overflow Cleanup

### Root Cause

When a user visits the Staffing page, TWO tours run simultaneously:
1. **HeaderTour** (via `OverlayTour`) -- targets search bar, notifications, etc.
2. **StaffingTour** -- targets filters, tabs, table, etc.

The `StaffingTour` was recently fixed to clean up overflow on finish/skip. However, the `OverlayTour` has **zero cleanup logic** -- it just calls `completeTour()`. It also:
- Does NOT have `disableScrollParentFix` (so Joyride aggressively sets `overflow: hidden` on scroll parents like `main`)
- Does NOT clear `document.body.style.overflow`
- Does NOT clear inline overflow styles on any containers

When the user skips the header tour, Joyride's inline `overflow: hidden` remains on `main` and other scroll containers, making the entire page unscrollable.

### Fix

**`src/components/tour/OverlayTour.tsx`**:
- Add the same overflow cleanup logic used in `StaffingTour`
- Clear `document.body.style.overflow` on finish/skip
- Reset inline overflow/overflowX/overflowY on `main` and all scroll containers
- Add `disableScrollParentFix` prop to the Joyride component
- Add delayed resets at 100ms and 300ms for async Joyride cleanup

### Technical Details

```typescript
// In handleCallback, when status is FINISHED or SKIPPED:
document.body.style.overflow = '';
completeTour();

const resetScroll = () => {
  const mainContainer = document.querySelector('main');
  if (mainContainer) {
    (mainContainer as HTMLElement).style.overflow = '';
    (mainContainer as HTMLElement).style.overflowX = '';
    (mainContainer as HTMLElement).style.overflowY = '';
  }
  const scrollContainers = document.querySelectorAll(
    '[class*="overflow-auto"], [class*="overflow-y-auto"], [class*="overflow-x-auto"], [class*="overflow-y-scroll"], [class*="overflow-x-scroll"]'
  );
  scrollContainers.forEach(el => {
    (el as HTMLElement).style.overflow = '';
    (el as HTMLElement).style.overflowX = '';
    (el as HTMLElement).style.overflowY = '';
  });
};

setTimeout(resetScroll, 100);
setTimeout(resetScroll, 300);
```

Also add `disableScrollParentFix` to the Joyride component props.

### File Changed

| File | Change |
|------|--------|
| `src/components/tour/OverlayTour.tsx` | Add overflow cleanup on finish/skip, add `disableScrollParentFix` prop |

