

## Add Searchable Micro-Tour Browser to Support Page

### What Changes

Replace the current card-based `UserGuidesTab` with an enhanced version that includes:

1. **A search field** at the top to filter across all tour sections and their individual steps
2. **Expandable section rows** (like the TourLauncher) so users can browse and launch individual steps directly
3. Keep the existing category tabs (Staffing, Positions, Admin, Feedback, Overlays) for organization

### How It Works

- User types in the search field (e.g., "FTE Variance")
- The list filters to show only sections containing matching steps, with matched steps visible
- Clicking a section name launches the full section tour (existing behavior)
- Clicking an individual step name launches a single-step micro-tour using `startMicroTour`
- Completed tours still show the "Done" badge and "Reset" button

### Layout

```text
[Search tours and steps...          ]

Tabs: [Staffing] [Positions] [Admin] [Feedback] [Overlays]

> Staffing Summary (30 steps)                    [Done] [Go & Start]
    - Filter Bar
    - Region Filter
    - FTE Variance    <-- click to launch single step
    - ...
> Position Planning (6 steps)                          [Go & Start]
    - ...
```

When searching, tabs auto-filter to only show categories with matches, and sections auto-expand to reveal matched steps (highlighted).

### Technical Details

**File: `src/components/support/UserGuidesTab.tsx`** -- Full refactor

- Import `TOUR_STEP_REGISTRY`, `getStepTitle` from `tourStepRegistry`
- Import `APP_TOUR_SEQUENCE` from `tourConfig`
- Import `Collapsible` components
- Import `SearchField` component
- Import `startMicroTour` from `useTourStore`
- Add search state using `useDebouncedSearch` hook
- For each guide in `guideCatalog`, look up its steps from `TOUR_STEP_REGISTRY[guide.tourKey]`
- Render each guide as a `Collapsible` row with:
  - Chevron to expand/collapse individual steps
  - Section title + step count + completion badge (existing)
  - "Go & Start" button for full tour (existing)
  - Expandable sub-list of individual step titles (new)
- Filter logic: match search query against section title, description, AND individual step titles
- When search is active, auto-expand sections that have matching steps and highlight matched step names

### Files Changed

| File | Change |
|------|--------|
| `src/components/support/UserGuidesTab.tsx` | Add search field, expandable section rows with individual step sub-lists, micro-tour launch capability |

