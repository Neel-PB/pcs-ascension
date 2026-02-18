

## Fix: Tour Leaving UI Unresponsive After Finish/Skip

### Root Cause

When Joyride runs, it sets `overflow: hidden` on `document.body` and sometimes on scroll parent containers to control scrolling during the tour. The `StaffingTour` component does NOT clean up these styles when the tour finishes or is skipped, leaving the page locked.

The `PositionsTour` already has this fix (lines 32-47) with:
- `document.body.style.overflow = ''`
- Clearing inline overflow on table containers
- Delayed resets at 100ms and 300ms to catch async Joyride cleanup

The `StaffingTour` is missing all of this cleanup.

### Fix

Update `StaffingTour.tsx` to add the same cleanup logic from `PositionsTour`:

**`src/components/tour/StaffingTour.tsx`** -- Update the `handleCallback` finish/skip block:

```typescript
if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
  // Clear body overflow that Joyride may have set
  document.body.style.overflow = '';
  completeTour();

  const resetScroll = () => {
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'instant' });
      (mainContainer as HTMLElement).style.overflow = '';
    }
    // Clear any overflow locks on scroll containers
    const scrollContainers = document.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-x-auto"]');
    scrollContainers.forEach(el => {
      (el as HTMLElement).style.overflow = '';
      el.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  };

  // Delayed resets to catch Joyride's async DOM cleanup
  setTimeout(resetScroll, 100);
  setTimeout(resetScroll, 300);
}
```

Also add `disableScrollParentFix` prop to the Joyride component (matching PositionsTour) to prevent Joyride from aggressively modifying scroll parent styles.

### Single File Changed

| File | Change |
|------|--------|
| `src/components/tour/StaffingTour.tsx` | Add body/container overflow cleanup on finish/skip, add delayed resets, add `disableScrollParentFix` prop |

