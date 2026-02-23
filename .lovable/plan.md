

## Fix: Allow Filter Interaction During "Facility Required" Tour Step

### Problem
The "Facility Required" step spotlights the empty state area, but the Joyride overlay blocks clicks on the filter bar (Region, Market, Facility). The user has no way to select a facility -- they can only skip or continue.

### Solution
Add `disableOverlay: true` to both empty-state tour steps. This removes the dimming overlay entirely for that step, letting users freely click on filters while the tooltip floats as guidance. Once a facility is selected, the step filtering logic already handles showing the correct content steps.

### Changes

**`src/components/tour/tourSteps.ts`** -- Add `disableOverlay: true` to both empty-state steps:
- `volumeSettingsSteps[0]`: add `disableOverlay: true`
- `npSettingsSteps[0]`: add `disableOverlay: true`

That's it -- one property added to two steps. The existing `effectiveSteps` filtering in `StaffingTour.tsx` will automatically swap to the content steps once a facility is selected.

