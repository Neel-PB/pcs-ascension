

## Fix: Show Only the Empty-State Step When No Facility Is Selected

### Problem
The tour shows "Facility Required" as step **1 of 6**, but steps 2-6 target DOM elements that only exist when a facility is selected. Clicking "Next" breaks the tour.

### Solution
Re-add step filtering logic in `StaffingTour.tsx` so that:
- **No facility selected**: Only show the "Facility Required" step (1 of 1), then auto-advance to the next tour section
- **Facility selected**: Skip the "Facility Required" step and show only the content steps (5 of 5)

### Changes

**1. `src/components/tour/tourSteps.ts`**
- Add `data: { emptyState: true }` to the "Facility Required" step in both `volumeSettingsSteps` and `npSettingsSteps` so they can be identified for filtering.

**2. `src/components/tour/StaffingTour.tsx`**
- Import `useFilterStore` to read `selectedFacility`
- In the `effectiveSteps` memo, filter steps:
  - On settings tabs with no facility: keep only steps with `data.emptyState`
  - On settings tabs with a facility: exclude steps with `data.emptyState`
  - On other tabs: no filtering

This is a minimal change -- just 2 lines of state and a filter condition in the existing memo. No z-index hacks, no restart effects, no refs needed. The tour will show "1/1" for the empty state, then auto-advance to the next section (Positions).

### Technical Details

**tourSteps.ts** -- tag empty-state steps:
```ts
// volumeSettingsSteps[0] and npSettingsSteps[0]
data: { emptyState: true },
```

**StaffingTour.tsx** -- add filtering:
```ts
import { useFilterStore } from '@/stores/useFilterStore';

const selectedFacility = useFilterStore(s => s.selectedFacility);
const isSettingsTab = activeTab === 'volume-settings' || activeTab === 'np-settings';

const effectiveSteps = useMemo(() => {
  let steps = isMicro ? [rawSteps[microTourStep.stepIndex]] : rawSteps;
  if (isSettingsTab) {
    const hasFacility = selectedFacility && selectedFacility !== 'all-facilities';
    steps = hasFacility
      ? steps.filter(s => !s.data?.emptyState)
      : steps.filter(s => s.data?.emptyState);
  }
  return injectSectionMetadata(steps, tourKey);
}, [rawSteps, tourKey, isMicro, microTourStep?.stepIndex, isSettingsTab, selectedFacility]);
```

### Result
- No facility: Tour shows "Facility Required (1/1)", user clicks Next, tour advances to the next section
- Facility selected: Tour shows the actual content steps (Status Summary, Override Table, etc.) without the "Facility Required" prompt
- Clean, no hacks
