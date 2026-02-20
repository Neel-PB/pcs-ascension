

## Expandable TourLauncher with Individual Step Selection

### Concept

Transform the existing TourLauncher sheet so each section row is **expandable**. When a user clicks the expand arrow, it reveals the individual steps within that section. Clicking any individual step launches a **single-step Joyride** that spotlights just that one element with its full tooltip content (including the demo previews).

This keeps the micro-tour capability entirely within the tour system -- no changes to app components, no help icons, no context menus.

### How It Works

```text
TourLauncher Sheet
-------------------
Staffing
  [>] Summary (22 steps)             <-- click row = run full section tour (existing)
      [>] expands to:
          - Filter Bar                <-- click = single-step Joyride for just this
          - Region Filter
          - Market Filter
          - ...
          - FTE Variance              <-- user clicks this
          - ...
          - Employment Type Split
  [>] Planned Resources (6 steps)
  [>] Variance Analysis (5 steps)
  ...
```

### User Flow

1. User opens "All Tours" from the header menu (existing)
2. Sees the grouped sections (Staffing, Positions, Admin, Overlays) -- unchanged
3. Clicks the **expand chevron** on a section row to see individual steps listed underneath
4. Clicks a step name (e.g., "FTE Variance") -- the launcher closes, navigates to the correct page/tab, and launches a **1-step Joyride** targeting just that element
5. Clicking the section name itself (not the chevron) still runs the full section tour as before

### Technical Plan

#### 1. Create a Step Registry (`src/components/tour/tourStepRegistry.ts`)

A centralized map of `tourKey -> Step[]` so the TourLauncher can look up individual steps for any section without importing every step array directly.

```text
tourKey "staffing" -> staffingSteps[]
tourKey "staffing-planning" -> planningSteps[]
...etc
```

Each step's `title` field becomes the display name in the expandable list.

#### 2. Add `startMicroTour` to `useTourStore`

New store action that stores both the tour key AND a specific step index:

- `microTourStep: { tourKey: string; stepIndex: number } | null`
- `startMicroTour(tourKey, stepIndex)` -- sets this state

The Joyride components (StaffingTour, PositionsTour, OverlayTour) will check for `microTourStep` and, if set, run Joyride with only that single step instead of the full array.

#### 3. Update TourLauncher UI

- Add an expand/collapse chevron to each section row
- When expanded, render a sub-list of step titles pulled from the registry
- Each sub-item is clickable and triggers `startMicroTour(tourKey, stepIndex)`
- The launch logic reuses the existing navigation (page + tab + overlay open) before starting

#### 4. Update Joyride Components

StaffingTour, PositionsTour, AdminTour, and OverlayTour will check `useTourStore.microTourStep`:
- If `microTourStep` is set and matches their tour key, they pass `[steps[stepIndex]]` to Joyride instead of the full array
- On completion, they clear `microTourStep` (no auto-continue to next section)

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourStepRegistry.ts` | **New** -- centralized map of tourKey to steps array |
| `src/stores/useTourStore.ts` | Add `microTourStep` state, `startMicroTour()` and `clearMicroTour()` actions |
| `src/components/tour/TourLauncher.tsx` | Add expandable rows showing individual step titles; clicking a step calls `startMicroTour` then navigates |
| `src/components/tour/StaffingTour.tsx` | Check `microTourStep`; if matching, run single-step Joyride |
| `src/components/tour/PositionsTour.tsx` | Same micro-tour check |
| `src/components/tour/AdminTour.tsx` | Same micro-tour check |
| `src/components/tour/OverlayTour.tsx` | Same micro-tour check |

### Example: User Wants "FTE Variance" Only

1. Opens TourLauncher -> expands "Summary" section
2. Sees list: Filter Bar, Region Filter, ..., **FTE Variance**, ..., Employment Type Split
3. Clicks "FTE Variance"
4. Launcher closes, navigates to `/staffing?tab=summary`
5. After 600ms delay, `startMicroTour('staffing', 13)` fires
6. StaffingTour detects `microTourStep = { tourKey: 'staffing', stepIndex: 13 }`
7. Runs Joyride with only `[staffingSteps[13]]` -- spotlights the FTE Variance KPI with its full demo preview tooltip
8. User clicks "Done" -> tour ends, no auto-continue

