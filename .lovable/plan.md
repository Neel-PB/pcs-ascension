

## Interactive Guided Tour System

### Overview
Add a step-by-step guided tour using `react-joyride` that walks users through the Staffing page components. The "Take a Tour" option lives inside the user profile dropdown in the header. The system is designed to scale to other pages later, with role-aware tour content.

### Tour Steps for Staffing Page (Labor Team)
1. **Filter Bar** -- "Use these filters to narrow data by Region, Market, Facility, and Department. Filters cascade: selecting a Region updates available Markets."
2. **Tab Navigation** -- "Switch between Summary, Planned/Active Resources, Variance Analysis, Forecasts, and Settings views."
3. **FTE KPI Section** -- "These cards show staffing metrics like Vacancy Rate, Hired FTEs, and Target FTEs. Click any card for a detailed chart. Drag to reorder."
4. **Volume KPI Section** -- "Volume metrics track patient encounters. The highlighted Target Volume card drives staffing calculations."
5. **Productive Resources Section** -- "Track actual paid labor including contract staff, overtime, and PRN usage."
6. **Workforce Drawer Trigger** -- "Click this tab to open the Workforce Drawer for detailed position breakdowns."

### Architecture
The tour system is built as a reusable framework so additional pages (Positions, Analytics, etc.) and role-specific steps can be added later.

### New Files

#### `src/hooks/useTour.ts`
- Manages tour state: `run`, `startTour`, `completeTour`, `resetTour`
- Stores completion per page in `localStorage` (e.g., `helix-tour-staffing-completed`)
- Accepts a `pageKey` parameter so each page has independent tour state
- Auto-starts on first visit for that page

#### `src/components/tour/TourTooltip.tsx`
- Custom tooltip component matching the app's design system
- Uses `Card`, `Button` components for consistency
- Shows step counter ("Step 2 of 6"), title, description
- Back / Next / Skip buttons
- Primary-colored accent on the Next button

#### `src/components/tour/StaffingTour.tsx`
- Defines the Staffing page tour steps array
- Each step targets a `data-tour` attribute selector
- Renders `react-joyride` with the custom tooltip, spotlight overlay, and controlled mode
- Receives `run` and callbacks from `useTour`

#### `src/components/tour/tourSteps.ts`
- Centralized step definitions file; starts with `staffingSteps`
- Easy to add `positionsSteps`, `analyticsSteps`, etc. later
- Each step: `{ target, title, content, placement }`

### Modified Files

#### `src/components/shell/AppHeader.tsx`
- Import `useTour` hook and add a `startTour` callback
- Add a "Take a Tour" `DropdownMenuItem` with a `HelpCircle` icon between "Profile" and "Log out" in the user dropdown menu
- Clicking it calls `startTour('staffing')` (or whatever the current page is)
- Pass `tourRun` and `onTourComplete` down or use a lightweight Zustand store / context so the tour component on the page can pick it up

#### `src/stores/useTourStore.ts` (new)
- Small Zustand store: `{ activeTour: string | null, startTour, stopTour }`
- AppHeader writes to it; page-level tour components read from it
- Keeps header and page components decoupled

#### `src/pages/staffing/StaffingSummary.tsx`
- Add `data-tour` attributes to key wrapper elements:
  - `data-tour="filter-bar"` on the FilterBar wrapper div (line 462)
  - `data-tour="tab-navigation"` on the ToggleButtonGroup wrapper (line 482)
  - `data-tour="workforce-trigger"` on WorkforceDrawerTrigger
- Import and render `<StaffingTour />` component

#### `src/components/staffing/DraggableSectionsContainer.tsx`
- Pass `data-tour` attributes to section wrapper divs based on `section.id`:
  - `data-tour="fte-section"` for id `fte`
  - `data-tour="volume-section"` for id `volume`
  - `data-tour="productivity-section"` for id `productivity`

### Dependencies
- Install `react-joyride` (well-maintained, ~25KB gzipped, 7k+ GitHub stars)

### First-Visit Behavior
- On first load of the Staffing page, the tour auto-starts after a short delay (1s) to let the page render
- Completion sets `localStorage` flag so it doesn't auto-start again
- User can always re-trigger from the profile dropdown "Take a Tour"

### Role Awareness (Future-Ready)
- The `tourSteps.ts` file can accept a `permissions` object to conditionally include steps (e.g., only show "Volume Settings" step if `hasPermission("settings.volume_override")`)
- For now, the Staffing tour shows all 6 steps for the labor team; role filtering will be added when other page tours are built

