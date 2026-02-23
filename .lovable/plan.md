

## Fix: Tour Guide Should Prompt User to Select a Facility for Volume/NP Settings

### Problem

When the tour reaches the **Volume Settings** or **NP Settings** tabs without a market/facility selected, the tour step targets (e.g., `[data-tour="volume-settings-stats"]`) don't exist in the DOM because those tabs show a "Select a Facility" empty state. Joyride skips the entire section since it can't find the targets.

### Solution

Add a "pre-check" step at the beginning of both the `volumeSettingsSteps` and `npSettingsSteps` arrays that targets the **Facility filter** (`[data-tour="filter-facility"]`) and instructs the user to select a facility before continuing. The tour will pause on this step, giving the user time to pick a facility.

Additionally, in `StaffingTour.tsx`, detect when the tour is on a settings tab with no facility selected and only show the facility-selection prompt step -- then wait for the user to select a facility before showing the rest of the steps.

### Technical Details

**1. File: `src/components/tour/tourSteps.ts`**

Add a new first step to both `volumeSettingsSteps` and `npSettingsSteps`:

```ts
// Prepend to volumeSettingsSteps
{
  target: '[data-tour="filter-facility"]',
  title: 'Select a Facility',
  content: 'To view and manage volume overrides, first select a specific facility from this filter. The tour will continue once a facility is selected.',
  placement: 'bottom',
  disableBeacon: true,
  spotlightClicks: true,   // Allow clicking the filter while spotlight is active
  data: { requiresFacility: true },
},

// Same prepend for npSettingsSteps
{
  target: '[data-tour="filter-facility"]',
  title: 'Select a Facility',
  content: 'To view and manage NP overrides, first select a specific facility from this filter. The tour will continue once a facility is selected.',
  placement: 'bottom',
  disableBeacon: true,
  spotlightClicks: true,
  data: { requiresFacility: true },
},
```

**2. File: `src/components/tour/StaffingTour.tsx`**

- Import `useFilterStore` to read `selectedFacility`.
- When the active tab is `volume-settings` or `np-settings`, dynamically filter the steps:
  - If no facility is selected (`selectedFacility` is `all-facilities` or empty), only show the first "Select a Facility" step.
  - Once a facility IS selected, skip the first step and show the remaining tour steps.
- This way the tour waits on the facility prompt, and when the user selects a facility the component re-renders, Joyride restarts with the actual settings steps.

```ts
// In StaffingTour.tsx
import { useFilterStore } from '@/stores/useFilterStore';

// Inside the component:
const selectedFacility = useFilterStore(s => s.selectedFacility);
const needsFacility = (activeTab === 'volume-settings' || activeTab === 'np-settings')
  && (!selectedFacility || selectedFacility === 'all-facilities');

const effectiveSteps = useMemo(() => {
  let steps = isMicro ? [rawSteps[microTourStep.stepIndex]] : rawSteps;
  
  if (needsFacility) {
    // Only show the facility-selection prompt step
    steps = steps.filter(s => s.data?.requiresFacility);
  } else if (activeTab === 'volume-settings' || activeTab === 'np-settings') {
    // Facility selected -- skip the prompt step, show content steps
    steps = steps.filter(s => !s.data?.requiresFacility);
  }

  return injectSectionMetadata(steps, tourKey);
}, [rawSteps, tourKey, isMicro, microTourStep?.stepIndex, needsFacility, activeTab]);
```

- Also, add an effect: when `needsFacility` transitions from `true` to `false` (user selected a facility), restart the tour run so Joyride picks up the new steps:

```ts
useEffect(() => {
  if (run && !needsFacility && (activeTab === 'volume-settings' || activeTab === 'np-settings')) {
    // User just selected a facility while tour was paused; restart with content steps
    setRun(false);
    setTimeout(() => setRun(true), 400);
  }
}, [needsFacility]);
```

### Scope
- `src/components/tour/tourSteps.ts` -- Add 1 new step to `volumeSettingsSteps` and 1 to `npSettingsSteps`
- `src/components/tour/StaffingTour.tsx` -- Add facility-aware step filtering and auto-restart logic

### User Experience
1. Tour transitions to Volume Settings tab
2. If no facility selected: tour highlights the Facility filter with "Select a Facility" prompt; user can click the filter
3. User selects a facility
4. Tour automatically restarts with the actual Volume Settings steps (status summary, override table, etc.)
5. Same flow for NP Settings

