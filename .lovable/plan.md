

## Fix Cross-Tour Navigation for All Overlay Tours

### Problem

The `OverlayTour` component (used by Header, Sidebar, Feedback Panel, AI Hub, and Checklist tours) has no `handleNextSection` logic. When a tour finishes and the user clicks "Continue to [Next Section]", the callback only calls `completeTour()` which sets `activeTour` to null. The next tour is never started.

Page-based tours (StaffingTour, PositionsTour, AdminTour) each implement their own `handleNextSection` that looks up the next section via `getNextSection()` and either switches tabs or navigates. OverlayTour needs the same capability.

### Root Cause

In `OverlayTour.tsx` line 26, when `STATUS.FINISHED` fires, it calls `completeTour()` and does nothing else -- no next-section lookup, no `startTour()` call.

### Changes

**File: `src/components/tour/OverlayTour.tsx`**

Add `handleNextSection` logic to the callback, mirroring what the page-based tours do:

1. Import `getNextSection` from `./tourConfig` and `useNavigate` from `react-router-dom`
2. After `completeTour()` on FINISHED status (not SKIPPED with 'all'), check if the tour is running in single-section mode -- if so, do nothing (same as page tours)
3. If not single-section, call `getNextSection(tourKey)` to find the next tour in the sequence
4. Handle three cases for the next section:
   - **Overlay tour** (page is null): call `startTour(nextSection.tourKey)` after a 500ms delay
   - **Page-based tour** (page is set): navigate to `{page}?tab={tab}&tour=true`
   - **No next section**: do nothing (tour sequence complete)
5. Handle SKIPPED with `skipMode === 'section'` the same way (advance to next section)

### Affected Tour Transitions

Based on `APP_TOUR_SEQUENCE` order:
- `reports` (page tour) -> `header` (overlay) -- already handled by page tours
- `header` -> `sidebar` (overlay -> overlay) -- **BROKEN, will be fixed**
- `sidebar` -> `feedback` (overlay -> overlay) -- **BROKEN, will be fixed**
- `feedback` -> `ai-hub` (overlay -> overlay) -- **BROKEN, will be fixed**
- `ai-hub` -> `checklist` (overlay -> overlay) -- **BROKEN, will be fixed**
- `checklist` -> end -- already works (no next section)

### Technical Details

The key addition to `OverlayTour.tsx`'s `handleCallback`:

```
// After completeTour() on FINISHED:
if (!isMicro) {
  const { singleSection } = useTourStore.getState();
  if (!singleSection) {
    const nextSection = getNextSection(tourKey);
    if (nextSection) {
      if (!nextSection.page) {
        // Next is also an overlay tour
        setTimeout(() => {
          useTourStore.getState().startTour(nextSection.tourKey);
        }, 500);
      } else {
        // Next is a page tour
        navigate(
          `${nextSection.page}${nextSection.tab ? `?tab=${nextSection.tab}&tour=true` : '?tour=true'}`
        );
      }
    }
  }
}
```

The same pattern applies for `skipMode === 'section'` in the SKIPPED branch.

No other files need changes -- the tour steps, registry, config, and tooltip are all correct. The button already says "Continue to Sidebar Navigation" because `injectSectionMetadata` sets `nextSectionName` properly; it just had nowhere to go when clicked.

