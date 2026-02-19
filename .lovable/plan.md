

## Fix: Comments Tour Step - Pre-scroll Strategy

### Root Cause

When Joyride reaches the Comments step (step 9/9), the `[data-tour="positions-comments"]` element is off-screen to the far right of the horizontally scrolled table. With `disableScrolling: true`, Joyride cannot auto-scroll to it. The `STEP_BEFORE` callback does fire, but the manual scroll logic runs **too late** -- Joyride has already measured the element's position and determined it's not visible, so it silently skips the step and fires `FINISHED`.

The Active FTE and Shift steps work because during their `STEP_BEFORE`, those elements are relatively close to the viewport and the scroll + resize cycle is fast enough. The Comments column is much further to the right, so the timing is more critical.

### Solution

Pre-scroll the table to the Comments column **during the previous step's callback**, so by the time Joyride initializes step 9, the element is already in the viewport.

### Changes

**File: `src/components/tour/PositionsTour.tsx`**

1. Add handling for `EVENTS.STEP_AFTER` in the callback: when the **current step's target** is `[data-tour="positions-shift-cell"]` (step 8, the step right before Comments), pre-scroll the table horizontally to bring the Comments column into view.

2. This way, when Joyride proceeds to step 9, the Comments element is already visible in the viewport, and the standard `STEP_BEFORE` logic can fine-tune positioning.

### Technical Details

In the `handleCallback` function, add a new block:

```text
if (type === EVENTS.STEP_AFTER) {
  // Pre-scroll for the NEXT step if it's a table header target
  const nextIndex = data.index + 1;
  if (nextIndex < steps.length) {
    const nextTarget = steps[nextIndex].target as string;
    if (tableHeaderTargets.includes(nextTarget)) {
      const nextEl = document.querySelector(nextTarget);
      if (nextEl) {
        const scrollContainer = nextEl.closest('.overflow-x-auto');
        if (scrollContainer) {
          // Scroll to bring the next target into view
          const cellRect = nextEl.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const cellOffsetLeft = cellRect.left - containerRect.left + scrollContainer.scrollLeft;
          const centerOffset = cellOffsetLeft - (containerRect.width / 2) + (cellRect.width / 2);
          scrollContainer.scrollLeft = Math.max(0, centerOffset);
        }
      }
    }
  }
}
```

This ensures the Comments column is scrolled into view **before** Joyride tries to position its spotlight on step 9.

The existing `STEP_BEFORE` logic for header targets still fires to fine-tune positioning and dispatch resize events.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Add `STEP_AFTER` handler to pre-scroll table for upcoming header target steps |

