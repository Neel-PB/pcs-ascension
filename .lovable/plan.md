

## Fix Missing Tour Use Cases

### Findings

After auditing every page, tab, and feature against the tour registry, here are the gaps:

### 1. Feedback Management Page Tour Not Registered

The `feedbackPageTourSteps` array (5 steps) already exists in `tourSteps.ts` but is NOT registered in `TOUR_STEP_REGISTRY` or `APP_TOUR_SEQUENCE`. The User Guides tab lists it under `tourKey: "feedback-page"`, but since it has no registry entry, the micro-tour step list is empty and clicking individual steps does nothing.

**Fix:**
- Add `feedbackPageTourSteps` to `TOUR_STEP_REGISTRY` under key `feedback-page`
- Add `feedback-page` entry to `APP_TOUR_SEQUENCE` in `tourConfig.ts` with `page: '/feedback'`
- Import `feedbackPageTourSteps` in `tourStepRegistry.ts`

### 2. Analytics Page Has No Tour

The `/analytics` page has 4 tabs (Region, Market, Facility, Department) with volume trend charts, but no tour exists for it.

**Fix:**
- Create `analyticsTourSteps` in `tourSteps.ts` with steps for: tab navigation, chart cards, date range filters, and trend visualization
- Add `data-tour` attributes to `AnalyticsRegion.tsx` and `RegionVolumeTrendCharts.tsx`
- Register in `TOUR_STEP_REGISTRY`, `APP_TOUR_SEQUENCE`, and `UserGuidesTab`
- Add a Joyride instance (use existing `OverlayTour` pattern or create `AnalyticsTour`)

### 3. Reports Page Has No Tour

The `/reports` page has tabs and report cards but no tour.

**Fix:**
- Create `reportsTourSteps` in `tourSteps.ts` with steps for: tab navigation, report cards, and export buttons
- Add `data-tour` attributes to `ReportsRegion.tsx`
- Register in all tour infrastructure files

### 4. Sidebar Navigation Has No Tour Step

Users may not understand the icon-only sidebar. No tour step explains it.

**Fix:**
- Add a `sidebar` tour entry to the Header tour (or as a standalone overlay tour) with a step targeting the sidebar container
- Add `data-tour="sidebar-nav"` to the sidebar component

### 5. Organization Switcher Has No Tour Step

The org switcher in the sidebar has no tour coverage.

**Fix:**
- Add a step to the Header or Sidebar tour targeting `[data-tour="org-switcher"]`
- Add the `data-tour` attribute to `OrganizationSwitcher.tsx`

---

### Summary of Files to Change

| File | Changes |
|------|---------|
| `src/components/tour/tourStepRegistry.ts` | Import and register `feedbackPageTourSteps`; register new analytics and reports step arrays |
| `src/components/tour/tourConfig.ts` | Add `feedback-page`, `analytics`, and `reports` entries to `APP_TOUR_SEQUENCE` |
| `src/components/tour/tourSteps.ts` | Add `analyticsTourSteps` and `reportsTourSteps` arrays |
| `src/components/support/UserGuidesTab.tsx` | Add Analytics and Reports guide catalog entries |
| `src/pages/analytics/AnalyticsRegion.tsx` | Add `data-tour` attributes to key elements |
| `src/components/analytics/RegionVolumeTrendCharts.tsx` | Add `data-tour` attributes |
| `src/pages/reports/ReportsRegion.tsx` | Add `data-tour` attributes |
| `src/components/tour/headerTourSteps.ts` | Add sidebar navigation and org switcher steps |
| `src/components/layout/DynamicIconOnlySidebar.tsx` | Add `data-tour="sidebar-nav"` attribute |
| `src/components/layout/OrganizationSwitcher.tsx` | Add `data-tour="org-switcher"` attribute |

### Priority Order

1. Register `feedback-page` in `TOUR_STEP_REGISTRY` and `APP_TOUR_SEQUENCE` (quick fix, already written steps)
2. Add sidebar and org switcher steps to header tour
3. Create Analytics page tour
4. Create Reports page tour

