
## Split "Search & Actions" into three separate tour steps

### What changes

**1. Tour step definitions (`src/components/tour/positionsTourSteps.ts`)**

Replace the single "Search & Actions" step in all three arrays (employees, contractors, requisitions) with three individual steps:

- **Search** -- targets `[data-tour="positions-search"]`, explains the search field
- **Refresh** -- targets `[data-tour="positions-refresh"]`, explains the data refresh button
- **Advanced Filters** -- targets `[data-tour="positions-filter-btn"]`, explains the filter button

This increases step counts: employees 7 -> 9, contractors 7 -> 9, requisitions 5 -> 7.

**2. Add `data-tour` attributes to all three tab components**

In each of `EmployeesTab.tsx`, `ContractorsTab.tsx`, and `RequisitionsTab.tsx`:

- Add `data-tour="positions-search"` to the `SearchField` component
- Wrap the `DataRefreshButton` in a span/div with `data-tour="positions-refresh"`
- Add `data-tour="positions-filter-btn"` to the filter `Button`

**3. Update step counts in User Guides catalog (`src/components/support/UserGuidesTab.tsx`)**

- `positions-employees`: stepCount 7 -> 9
- `positions-contractors`: stepCount 7 -> 9
- `positions-requisitions`: stepCount 5 -> 7

### Files changed

| File | Change |
|------|--------|
| `src/components/tour/positionsTourSteps.ts` | Split "Search & Actions" step into 3 steps in all arrays |
| `src/pages/positions/EmployeesTab.tsx` | Add data-tour attrs to search, refresh, filter |
| `src/pages/positions/ContractorsTab.tsx` | Add data-tour attrs to search, refresh, filter |
| `src/pages/positions/RequisitionsTab.tsx` | Add data-tour attrs to search, refresh, filter |
| `src/components/support/UserGuidesTab.tsx` | Update stepCount values |
