

## Custom Page-Wise Tours with Named Overlay Sections

### Current State

The app has one monolithic 15-section tour that auto-flows across all pages. Overlay features (AI Hub, Feedback Panel, Workforce Checklist) exist as separate tours but are:
- Not included in the main tour sequence
- Not launchable from a central menu
- Not named or visible to users

### What Changes

#### 1. Add Overlay Tours to the Sequence (tourConfig.ts)

Add 3 new sections to `APP_TOUR_SEQUENCE` so they get proper names and section numbering:

| # | Tour Key | Name | Type |
|---|----------|------|------|
| 16 | `feedback` | Feedback Panel | Overlay |
| 17 | `ai-hub` | AI Assistant | Overlay |
| 18 | `checklist` | Positions Checklist | Overlay |

This makes them visible in the section badge ("Section 16 of 18") and gives them proper "Continue to..." labels.

#### 2. Create a Tour Launcher Menu (TourLauncher.tsx)

A new component accessible from the User Menu that lists all available tours grouped by page:

```
Staffing
  - Summary (7 steps)
  - Planned Resources (6 steps)
  - Variance Analysis (5 steps)
  - Forecasts (3 steps)
  - Volume Settings (5 steps)
  - NP Settings (5 steps)

Positions
  - Employees (9 steps)
  - Contractors (7 steps)
  - Open Positions (6 steps)

Admin
  - Users (6 steps)
  - Feed (2 steps)
  - RBAC (3 steps)
  - Audit Log (2 steps)
  - Settings (9 steps)

Overlays
  - Header (4 steps)
  - Feedback Panel (3 steps)
  - AI Assistant (4 steps)
  - Positions Checklist (4 steps)
```

Each item shows: name, step count, completion status (checkmark if completed). Clicking an item navigates to that page/tab and starts only that specific section's tour (not the full app-wide flow).

#### 3. Add "Start This Page Tour" vs "Start Full Tour" Options

In the User Menu dropdown (AppHeader.tsx), currently there's a single "Take a Tour" option. Change this to:

- **Tour This Page** -- starts only the current page/tab's tour without auto-continuing to the next section
- **Full Guided Tour** -- starts the full 18-section app-wide experience from the beginning
- **All Tours** -- opens the Tour Launcher menu showing all sections

#### 4. Support Single-Section Mode in Tour Components

Add a `singleSection` flag to `useTourStore`:

```typescript
interface TourState {
  activeTour: string | null;
  skipMode: 'section' | 'all' | null;
  singleSection: boolean; // NEW: when true, don't auto-continue
  // ...existing
}
```

When `singleSection` is `true`:
- `StaffingTour`, `PositionsTour`, `AdminTour` skip the `handleNextSection()` call on FINISHED
- The primary button on the last step says "Done" instead of "Continue to..."
- Skip Section and Skip All buttons are hidden (since we're only running one section)

#### 5. Open Overlay Panels Automatically for Overlay Tours

When launching `feedback`, `ai-hub`, or `checklist` tours from the Tour Launcher:
- Open the respective panel/drawer first
- Start the tour after a 600ms delay for the panel to render

This requires the Tour Launcher to call the panel's open function (from feedback store, AI hub store, or workforce drawer store) before starting the tour.

#### 6. Reset Individual Tours

Add a "Reset" button next to each completed tour in the Tour Launcher. This calls `localStorage.removeItem()` for that specific tour key, allowing users to re-run individual sections.

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourConfig.ts` | Add 3 overlay sections to APP_TOUR_SEQUENCE |
| `src/stores/useTourStore.ts` | Add `singleSection` flag and `startSingleTour()` action |
| `src/components/tour/TourLauncher.tsx` | **New** -- Tour Launcher menu with page-grouped sections |
| `src/components/tour/TourTooltip.tsx` | Hide section nav controls when `singleSection` is true; show "Done" label |
| `src/components/tour/StaffingTour.tsx` | Check `singleSection` before calling `handleNextSection()` |
| `src/components/tour/PositionsTour.tsx` | Check `singleSection` before calling `handleNextSection()` |
| `src/components/tour/AdminTour.tsx` | Check `singleSection` before calling `handleNextSection()` |
| `src/components/tour/OverlayTour.tsx` | Check `singleSection` before auto-continuing |
| `src/components/shell/AppHeader.tsx` | Replace single "Take a Tour" with 3 options; render TourLauncher |

### User Experience

1. New user visits the app for the first time -- the full 18-section tour starts automatically (same as today)
2. User clicks their avatar > "Tour This Page" -- runs only the current tab's tour (e.g., just "Variance Analysis"), then stops
3. User clicks avatar > "All Tours" -- opens a sheet/dialog listing all 18 sections with completion checkmarks and step counts
4. User clicks any section in the launcher -- navigates there and runs just that tour
5. User clicks avatar > "Full Guided Tour" -- resets all tours and runs the full experience from Section 1

