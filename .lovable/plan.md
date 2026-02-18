

## Fix: Table stays horizontally scrolled after tour ends

### Problem
The tour's final steps highlight cells on the right side of the table (Active FTE, Shift, Comments columns). When the tour finishes or is skipped, the scroll reset runs immediately -- but Joyride's internal cleanup (removing overlay, spotlight, and tooltips) happens asynchronously afterward. This cleanup triggers a layout reflow that re-scrolls the container back to where the spotlight was, undoing the reset.

### Solution
Delay the scroll reset using `setTimeout` so it runs **after** Joyride has fully cleaned up its DOM elements. This ensures our reset is the final scroll action.

### Technical Detail

**File: `src/components/tour/PositionsTour.tsx`**

In the completion handler (when status is FINISHED or SKIPPED):

1. Keep the immediate `document.body.style.overflow = ''` reset (this is fine immediately)
2. Wrap the scroll resets in a `setTimeout` with a small delay (e.g., 100ms) so they execute after Joyride finishes its internal DOM cleanup
3. Add a second delayed reset at ~300ms as a safety net for slower cleanup cycles

```
if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
  document.body.style.overflow = '';
  completeTour();

  // Delay scroll resets to run AFTER Joyride finishes its internal cleanup
  const resetScroll = () => {
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
    const tableContainer = document.querySelector('[class*="overflow-x-auto"]');
    if (tableContainer) {
      tableContainer.scrollTo({ left: 0, behavior: 'instant' });
    }
  };

  setTimeout(resetScroll, 100);
  setTimeout(resetScroll, 300);
}
```

This is a single-file change to `src/components/tour/PositionsTour.tsx`.

