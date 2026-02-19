

## Whole-App Tour System with Skip Section / Skip All

### Overview

Transform the tour system from isolated per-page tours into a unified whole-app guided experience. When a user starts the tour, it flows across pages and tabs automatically. At any point, the user can:
- **Next / Back** -- navigate within the current section
- **Skip Section** -- jump to the next section (next tab or next page)
- **Skip All** -- end the entire app tour immediately

### Full Tour Sequence

The tour will flow through the app in this order, matching the sidebar navigation:

```text
Page: Staffing
  1. Summary (30 steps)
  2. Planned/Active Resources (6 steps)
  3. Variance Analysis (5 steps)
  4. Forecasts (3 steps)
  5. Volume Settings (5 steps)
  6. NP Settings (5 steps)

Page: Positions
  7. Employees (9 steps)
  8. Contractors (9 steps)
  9. Open Positions (7 steps)

Page: Admin
  10. Users (6 steps)
  11. Feed (3 steps)
  12. RBAC (4 steps)
  13. Audit Log (3 steps)
  14. Settings (10 steps)

Overlay Tours (shown on any page):
  15. Header (4 steps)
```

### Redesigned TourTooltip UI

The tooltip gets a cleaner, more informative layout:

```text
+--------------------------------------------+
| [========--------] progress bar            |
+--------------------------------------------+
| Step Title                        3 / 30   |
|                                            |
| Description text here...                   |
|                                            |
| [ Staffing: Summary  --  Section 1 of 15 ]|
|                                            |
| Skip All  |  Skip Section  | [Back] [Next]|
+--------------------------------------------+
```

Changes:
- Section badge showing current section name and position (e.g., "Section 1 of 15")
- "Skip All" button (ghost, muted) -- ends all remaining tours
- "Skip Section" button (ghost) -- skips to the next section
- Last step of non-last sections: "Continue to [Next Section Name]" button
- Last step of final section: "Complete Tour" button
- Step dots hidden when > 10 steps (existing behavior)

### Store Changes (`useTourStore.ts`)

Add state to coordinate cross-page/cross-tab flow:

- `skipMode: 'section' | 'all' | null` -- communicates user intent from tooltip to tour component
- `setSkipMode(mode)` -- sets the skip mode
- `clearSkipMode()` -- resets after handling
- `skipAllTours()` -- marks all remaining tour keys as completed in localStorage and stops

### Section Metadata

Each step array will carry metadata via `step.data`:

```typescript
{
  sectionName: 'Summary',
  sectionIndex: 0,
  totalSections: 15,
  nextSectionName: 'Planned/Active Resources',
  isLastSection: false
}
```

This metadata is injected at the tour component level (not in tourSteps.ts) to keep step definitions clean.

### Cross-Page Navigation

When a tour finishes or the user clicks "Skip Section" and the next section is on a different page:

- **StaffingTour**: handles tab-to-tab transitions within `/staffing`, then navigates to `/positions` for the next page
- **PositionsTour**: handles tab-to-tab transitions within `/positions`, then navigates to `/admin`
- **AdminTour**: handles tab-to-tab transitions within `/admin`, then navigates back for header tour

Navigation between pages uses `react-router-dom`'s `useNavigate`. Each tour component receives an `onNavigate` callback from its page, or uses the navigate function directly.

### Implementation Flow

When "Skip Section" is clicked:
1. Tooltip calls `useTourStore.setSkipMode('section')` then triggers Joyride's skip
2. Tour component's callback sees `STATUS.SKIPPED` + `skipMode === 'section'`
3. Completes current tour, determines next section
4. If next section is same page (different tab): switches tab, starts next tour after 500ms
5. If next section is different page: navigates to the page with `?tour=true` search param
6. Target page detects `?tour=true` and auto-starts its first tour

When "Skip All" is clicked:
1. Tooltip calls `useTourStore.skipAllTours()` which marks all tour keys as completed in localStorage
2. Tour component's callback sees `STATUS.SKIPPED` + `skipMode === 'all'`
3. Stops everything, no continuation

### Files Changed

| File | Change |
|------|--------|
| `src/stores/useTourStore.ts` | Add `skipMode`, `setSkipMode`, `clearSkipMode`, `skipAllTours` actions |
| `src/components/tour/TourTooltip.tsx` | Redesigned footer with Skip All, Skip Section, section badge, contextual last-step labels |
| `src/components/tour/StaffingTour.tsx` | Handle skip modes, inject section metadata, navigate to `/positions` after last staffing tab |
| `src/components/tour/PositionsTour.tsx` | Add `onTabChange` prop, handle skip modes, cross-tab continuation, navigate to `/admin` after last positions tab |
| `src/components/tour/AdminTour.tsx` | Add `onTabChange` prop, handle skip modes, cross-tab continuation, navigate to header tour after last admin tab |
| `src/pages/positions/PositionsPage.tsx` | Pass `onTabChange` to PositionsTour, detect `?tour=true` to auto-start |
| `src/pages/admin/AdminPage.tsx` | Pass `onTabChange` to AdminTour, detect `?tour=true` to auto-start |
| `src/pages/staffing/StaffingSummary.tsx` | Detect `?tour=true` to auto-start, pass navigate to StaffingTour |
| `src/hooks/useTour.ts` | Add support for external tour trigger via `?tour=true` URL param |

### Section Sequence Configuration

A central constant (in `useTourStore.ts` or a new `tourConfig.ts`) defines the full sequence:

```typescript
const APP_TOUR_SEQUENCE = [
  { page: '/staffing', tab: 'summary', tourKey: 'staffing', name: 'Summary' },
  { page: '/staffing', tab: 'planning', tourKey: 'staffing-planning', name: 'Planned Resources' },
  { page: '/staffing', tab: 'variance', tourKey: 'staffing-variance', name: 'Variance Analysis' },
  { page: '/staffing', tab: 'forecasts', tourKey: 'staffing-forecasts', name: 'Forecasts' },
  { page: '/staffing', tab: 'volume-settings', tourKey: 'staffing-volume-settings', name: 'Volume Settings' },
  { page: '/staffing', tab: 'np-settings', tourKey: 'staffing-np-settings', name: 'NP Settings' },
  { page: '/positions', tab: 'employees', tourKey: 'positions-employees', name: 'Employees' },
  { page: '/positions', tab: 'contractors', tourKey: 'positions-contractors', name: 'Contractors' },
  { page: '/positions', tab: 'requisitions', tourKey: 'positions-requisitions', name: 'Open Positions' },
  { page: '/admin', tab: 'users', tourKey: 'admin-users', name: 'Admin Users' },
  { page: '/admin', tab: 'feed', tourKey: 'admin-feed', name: 'Admin Feed' },
  { page: '/admin', tab: 'access-control', tourKey: 'admin-access-control', name: 'RBAC' },
  { page: '/admin', tab: 'audit-log', tourKey: 'admin-audit-log', name: 'Audit Log' },
  { page: '/admin', tab: 'settings', tourKey: 'admin-settings', name: 'Admin Settings' },
  { page: null, tab: null, tourKey: 'header', name: 'Header' },
];
```

This gives each tour component the ability to look up where it is in the overall sequence and what comes next (including cross-page navigation).
