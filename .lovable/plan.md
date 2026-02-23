

## Simplify: Tour Shows the Empty State Instead of Highlighting the Filter

### Problem
The current implementation adds special tour steps that highlight the facility filter and try to let the user interact with it during the tour. This is overly complex. The page already has a clear "Select a Facility" empty state (the screen you showed). The tour should simply show that empty state as a tour step and move on, rather than skipping the entire section.

### Changes

**1. `src/pages/staffing/SettingsTab.tsx` (line ~201) and `src/pages/staffing/NPSettingsTab.tsx` (line ~201)**

Add a `data-tour` attribute to the empty state container so the tour can target it:
- SettingsTab: `data-tour="volume-settings-empty"`
- NPSettingsTab: `data-tour="np-settings-empty"`

**2. `src/components/tour/tourSteps.ts`**

Replace the current "requiresFacility" steps (that target the filter) with steps that target the empty state containers instead. Remove `spotlightClicks` and `requiresFacility` metadata:

- `volumeSettingsSteps[0]`: Change target from `[data-tour="filter-facility"]` to `[data-tour="volume-settings-empty"]`, update content to explain that a facility must be selected to see override data, remove `spotlightClicks` and `data: { requiresFacility: true }`.
- `npSettingsSteps[0]`: Same change, targeting `[data-tour="np-settings-empty"]`.

**3. `src/components/tour/StaffingTour.tsx`**

Remove the facility-aware step filtering logic:
- Remove `useFilterStore` import and `selectedFacility` / `needsFacility` / `isSettingsTab` logic
- Remove the `useEffect` that restarts the tour when a facility is selected
- Remove the `prevNeedsFacility` ref
- Simplify `effectiveSteps` back to just `injectSectionMetadata(rawSteps, tourKey)` (keeping micro-tour logic)

**4. `src/components/staffing/FilterBar.tsx`**

Revert the z-index boost changes:
- Remove `useTourStore` import
- Remove `activeTour` and `isTourNeedingFacility` variables
- Restore PopoverContent to always use `z-50`

### Result
- Tour arrives at Volume Settings tab, shows the "Select a Facility" empty state with an explanation step, then continues to the next section
- Same for NP Settings
- No special filter interaction, no z-index hacks
- Clean and simple
