

## Fix: Scroll to Top After Audit Log Tour Completes

### Problem
After finishing the Audit Log tour, the page remains scrolled down to the audit table (the last tour step target). The tab navigation bar at the top is out of view, so you cannot switch tabs or scroll back up easily.

### Root Cause
The tour's `handleCallback` scrolls elements into view during steps (`scrollIntoView`), but when the tour finishes (`STATUS.FINISHED` or `STATUS.SKIPPED`), it only calls `completeTour()` without scrolling the content area back to the top.

### Fix
In `AdminTour.tsx`, after the tour completes, scroll the content container (the `overflow-y-auto` div in AdminPage) back to the top.

### Technical Change

**`src/components/tour/AdminTour.tsx`** (~line 34)

In the `handleCallback`, after detecting `STATUS.FINISHED` or `STATUS.SKIPPED`, scroll the scrollable content container back to the top before calling `completeTour()`:

```diff
  if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
+   // Scroll the content area back to top so tabs are visible
+   const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
+   if (scrollContainer) {
+     scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
+   }
    completeTour();
  }
```

This ensures that after any admin tour completes, the view resets to show the tab navigation at the top, allowing users to switch tabs or continue navigating.

