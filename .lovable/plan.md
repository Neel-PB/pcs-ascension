

## Add Tour Guide for Planned/Active Resources Tab

### Overview
Add a dedicated set of tour steps for the "Planned/Active Resources" tab (Position Planning page), covering the key interactive elements: toggles, legend, table groups, and action buttons.

### Tour Steps (6 steps)

1. **Page Title & Purpose** -- Targets the header. "This view breaks down your staffing by skill type and shift (Day/Night), showing Target FTEs, Hired/Active FTEs, Open Requisitions, and Variance."
2. **Hired/Active Toggle** -- Targets the Hired/Active pill toggle. "Switch between Hired (all employees including those on leave) and Active (currently available staff adjusted by department leaders)."
3. **Nursing/Non-Nursing Toggle** -- Targets the Nursing/Non-Nursing pill toggle. "Filter between Nursing (clinical departments with full Target/Variance columns) and Non-Nursing (showing only Hired and Open Reqs). When a specific department is selected, this auto-sets based on the department type."
4. **FTE Legend** -- Targets the surplus/shortage legend. "Positive values indicate an FTE surplus. Orange negative values indicate an FTE shortage that needs attention."
5. **Expandable Skill Groups** -- Targets the table container. "Skills are grouped into Overheads, Clinical Staff, and Support Staff. Click any group row to expand and see individual skill breakdowns."
6. **Action Buttons** -- Targets the action buttons area. "Use these buttons to refresh data, download the table as CSV, or expand to a full-screen view."

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Add a new `planningSteps: Step[]` array with 6 steps targeting `data-tour` selectors:
  - `[data-tour="planning-header"]`
  - `[data-tour="planning-hired-toggle"]`
  - `[data-tour="planning-nursing-toggle"]`
  - `[data-tour="planning-legend"]`
  - `[data-tour="planning-table"]`
  - `[data-tour="planning-actions"]`

#### `src/pages/staffing/PositionPlanning.tsx`
- Add `data-tour` attributes to the corresponding wrapper elements:
  - `data-tour="planning-header"` on the h1 title wrapper
  - `data-tour="planning-hired-toggle"` on the Hired/Active toggle container
  - `data-tour="planning-nursing-toggle"` on the Nursing/Non-Nursing toggle container
  - `data-tour="planning-legend"` on the legend div
  - `data-tour="planning-table"` on the table container div
  - `data-tour="planning-actions"` on the action buttons div

#### `src/components/tour/StaffingTour.tsx`
- Import `planningSteps` from tourSteps
- Read the current `activeTab` (pass it as a prop from StaffingSummary, or read from context/URL)
- Conditionally use `staffingSteps` when on "summary" tab and `planningSteps` when on "planning" tab
- Update the `useTour` hook call to use a tab-aware page key (e.g., `staffing-summary`, `staffing-planning`) so each tab has independent first-visit and completion tracking

#### `src/pages/staffing/StaffingSummary.tsx`
- Pass `activeTab` as a prop to `<StaffingTour activeTab={activeTab} />`

#### `src/hooks/useTour.ts`
- No changes needed -- it already accepts a `pageKey` parameter, so using `staffing-planning` as the key will give independent localStorage tracking

### Result
Each staffing tab gets its own tour with independent auto-start on first visit and re-trigger from "Take a Tour" in the profile dropdown. The planning tour walks users through the 6 key elements of the FTE Skill Shift Analysis view.

