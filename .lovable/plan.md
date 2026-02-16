

## Add Tour Guides for the Positions Module

### Overview
Create a tab-aware tour system for the Positions module (Employees, Contractors, Open Positions), following the same pattern as the Staffing module's `StaffingTour` component. Since all three tabs share identical UI structure (search bar + filter button + data table + detail sheet), the tours will highlight these common elements with tab-specific descriptions.

### Tour Steps

#### Employees Tour (4 steps)
1. **Filter Bar** -- `[data-tour="filter-bar"]` -- "Use these filters to narrow the employee roster by Region, Market, Facility, and Department."
2. **Tab Navigation** -- `[data-tour="positions-tabs"]` -- "Switch between Employees, Contractors, and Open Positions views."
3. **Search & Actions** -- `[data-tour="positions-search-bar"]` -- "Search by name, position number, job title, or department. Use the filter button for advanced filtering by status, employment type, shift, and FTE range."
4. **Data Table** -- `[data-tour="positions-table"]` -- "Click any row to open the employee detail sheet with full position information and comments. Columns can be resized, reordered, and toggled."

#### Contractors Tour (4 steps)
Same targets as Employees but with contractor-specific descriptions (e.g., "contractor roster", "contractor detail sheet").

#### Open Positions Tour (4 steps)
Same targets but with requisition-specific descriptions, mentioning vacancy age badges and position lifecycle.

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Add three new exported arrays: `employeesTourSteps`, `contractorsTourSteps`, `requisitionsTourSteps`
- Each array has 4 steps targeting the same `data-tour` attribute names (shared UI structure)

#### New: `src/components/tour/PositionsTour.tsx`
- Follows the same pattern as `StaffingTour.tsx`
- Accepts `activeTab` prop (`'employees'` | `'contractors'` | `'requisitions'`)
- Maps each tab to its tour key (`positions-employees`, `positions-contractors`, `positions-requisitions`) and step array
- Uses the same Joyride config, `TourTooltip`, and `useTour` hook

#### `src/pages/positions/PositionsPage.tsx`
- Import and render `<PositionsTour activeTab={activeTab} />`
- Add `data-tour="positions-tabs"` on the `ToggleButtonGroup` wrapper div

#### `src/pages/positions/EmployeesTab.tsx`
- Add `data-tour="positions-search-bar"` on the search/actions row div
- Add `data-tour="positions-table"` on the `EditableTable` wrapper

#### `src/pages/positions/ContractorsTab.tsx`
- Same `data-tour` attributes as EmployeesTab

#### `src/pages/positions/RequisitionsTab.tsx`
- Same `data-tour` attributes as EmployeesTab

### Tour Trigger Behavior
- Each tab's tour auto-starts on first visit (tracked via localStorage keys: `helix-tour-positions-employees-completed`, etc.)
- Re-triggerable via "Take a Tour" dropdown using the `positions` key -- the `useTour` hook's base-path matching (`activeTour === pageKey.split('-')[0]`) will trigger whichever tab is currently active
- Uses `zIndex: 10000` (same as StaffingTour, below overlay panels)

### Key Pattern: Component Remounting
Since `PositionsPage` conditionally renders only the active tab, switching tabs unmounts/remounts the `PositionsTour` with a new `tourKey`, ensuring clean state -- identical to the StaffingTour approach.

