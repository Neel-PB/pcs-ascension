

## Add Individual Filter Steps to Staffing Summary Tour

### Overview

Split the current single "Filter Bar" tour step into individual steps for each filter dropdown (Region, Market, Facility, Department, Clear button, and More Filters), explaining what each does without triggering any data fetches.

### Changes

**1. Add `data-tour` attributes to filter elements in `src/components/staffing/FilterBar.tsx`**

Add `data-tour` attributes to each filter's outer wrapper `div`:

| Element | Attribute |
|---------|-----------|
| Region Select wrapper | `data-tour="filter-region"` |
| Market Select wrapper | `data-tour="filter-market"` |
| Facility Popover wrapper | `data-tour="filter-facility"` |
| Department Popover wrapper | `data-tour="filter-department"` |
| Clear Filters Button | `data-tour="filter-clear"` |
| CombinedOptionalFilters / optional filters div | `data-tour="filter-more"` |

**2. Expand `staffingSteps` in `src/components/tour/tourSteps.ts`**

Replace the single "Filter Bar" step (step 1) with 7 steps:

| # | Target | Title | Content |
|---|--------|-------|---------|
| 1 | `[data-tour="filter-bar"]` | Filter Bar | Use these cascading filters to narrow staffing data. Selecting a higher-level filter updates the options available in lower-level filters. |
| 2 | `[data-tour="filter-region"]` | Region Filter | Select a Region to scope all data to that geographic area. Choosing a region updates the available Markets, Facilities, and Departments below. |
| 3 | `[data-tour="filter-market"]` | Market Filter | Select a Market within the chosen Region. This further narrows Facility and Department options. |
| 4 | `[data-tour="filter-facility"]` | Facility Filter | Search and select a specific Facility. This is a searchable dropdown -- type a name or ID to find it quickly. Selecting a facility scopes Departments to that location. |
| 5 | `[data-tour="filter-department"]` | Department Filter | Search and select a Department. Also searchable by name or ID. Once selected, all KPIs and tables reflect only that department's data. |
| 6 | `[data-tour="filter-clear"]` | Clear Filters | Click this button to reset all filters back to their defaults. It is disabled when no filters are active. |
| 7 | `[data-tour="filter-more"]` | More Filters | Additional filters for Submarket, Level 2, and PSTAT. Use these for finer-grained analysis without changing the primary hierarchy. |

The remaining steps (Tab Navigation, KPI overview, individual KPIs, etc.) follow after these.

**3. Update step count in `src/components/support/UserGuidesTab.tsx`**

Update the staffing summary `stepCount` from 26 to 32 (added 6 new filter steps).

### Files changed

| File | Change |
|------|--------|
| `src/components/staffing/FilterBar.tsx` | Add `data-tour` attributes to Region, Market, Facility, Department wrappers, Clear button, and optional filters wrapper |
| `src/components/tour/tourSteps.ts` | Replace single "Filter Bar" step with 7 individual filter steps in `staffingSteps` |
| `src/components/support/UserGuidesTab.tsx` | Update stepCount 26 -> 32 |

