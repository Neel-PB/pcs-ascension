

## Add Tour Guide for Variance Analysis Tab

### Overview
Add a 5-step guided tour for the "Variance Analysis" tab, extending the existing tab-aware tour system. This completes tour coverage for the three main Staffing tabs (Summary, Planned/Active Resources, Variance Analysis).

### Tour Steps (5 steps)

1. **Page Header** -- Targets the "Variance Analysis" title. "This table shows FTE variance by skill type across your selected scope. Data adapts automatically based on your filter selections (Region, Market, Facility, Department)."
2. **FTE Legend** -- Targets the +/- legend. "Positive (+) values indicate an FTE shortage. Negative (-) values indicate an FTE surplus."
3. **Skill Column Headers** -- Targets the table header row. "Variance is broken down by skill type: CL (Clinical Lead), RN (Registered Nurse), PCT (Patient Care Tech), HUC (Health Unit Coordinator), and Overhead."
4. **Expandable Groups** -- Targets the table body. "Rows are grouped by Region, Submarket, or Facility depending on your filter level. Click any group row to expand and see individual breakdowns."
5. **Action Buttons** -- Targets the refresh/download/expand buttons. "Use these buttons to refresh data, download the table as CSV, or expand to a full-screen view."

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Add a new exported `varianceSteps: Step[]` array with 5 steps targeting:
  - `[data-tour="variance-header"]`
  - `[data-tour="variance-legend"]`
  - `[data-tour="variance-skill-headers"]`
  - `[data-tour="variance-table"]`
  - `[data-tour="variance-actions"]`

#### `src/pages/staffing/VarianceAnalysis.tsx` (the one in `src/pages/staffing/`)
- Add `data-tour` attributes to the corresponding UI elements:
  - `data-tour="variance-header"` on the h2 title element (line 672)
  - `data-tour="variance-legend"` on the legend div (line 675)
  - `data-tour="variance-actions"` on the action buttons div (line 687)
  - `data-tour="variance-skill-headers"` on the first TableRow inside TableHeader of VarianceTable (line 624)
  - `data-tour="variance-table"` on the table container div (line 722)

#### `src/components/tour/StaffingTour.tsx`
- Import `varianceSteps` from tourSteps
- Extend the conditional logic to handle `activeTab === 'variance'`:
  - tourKey: `'staffing-variance'`
  - steps: `varianceSteps`

No changes needed to `useTour.ts` or `StaffingSummary.tsx` (already passes `activeTab` and uses `key={activeTab}` for remounting).

