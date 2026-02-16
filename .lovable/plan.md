

## Restructure Staffing Summary Tour Steps

### What Changes
The current 8-step staffing summary tour walks through KPI sections one at a time (FTE, Volume, Productivity), then shows chart/info/split actions. The user wants a restructured flow that:

1. Introduces **all KPI cards together** (not section by section)
2. Explains the **trend chart** action
3. Explains the **info/definition view** action
4. Covers the **Target Vol / Override Vol color behavior** (green highlight = target in use, orange = override active)
5. Covers the **employment type split badge**

### New Tour Steps (7 steps)

| # | Target | Title | Content |
|---|--------|-------|---------|
| 1 | `[data-tour="filter-bar"]` | Filter Bar | Use these filters to narrow data by Region, Market, Facility, and Department. Filters cascade: selecting a Region updates the available Markets. |
| 2 | `[data-tour="tab-navigation"]` | Tab Navigation | Switch between Summary, Planned/Active Resources, Variance Analysis, Forecasts, and Settings views. |
| 3 | `[data-tour="fte-section"]` | KPI Cards | All staffing metrics are organized into three draggable sections: FTE, Volume, and Productive Resources. Each card shows a key metric. Drag section headers to reorder them. |
| 4 | `[data-tour="kpi-chart-action"]` | Trend Chart | Click the chart icon on any KPI card to view a detailed trend line, historical data, and breakdowns by skill type. |
| 5 | `[data-tour="kpi-info-action"]` | Definition and Calculation | Click the eye icon to see what this KPI measures and the exact formula used to calculate it. |
| 6 | `[data-tour="volume-section"]` | Target and Override Volume Colors | Volume cards use color to show status: a green border means the calculated Target Volume is in use; an orange border means a manual Override Volume is active and superseding the target. |
| 7 | `[data-tour="kpi-split-badge"]` | Employment Type Split | This badge shows the FT/PT/PRN staffing mix. The target is 70% Full-Time, 20% Part-Time, 10% PRN. Click to compare current vs target variance. |

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Replace the existing `staffingSteps` array (lines 3-60) with the 7 new steps described above
- Steps 1-2 (Filter Bar, Tab Navigation) remain unchanged
- Step 3 replaces the three separate section steps with one combined step targeting `fte-section` (the first section visible)
- Step 4 (Trend Chart) and Step 5 (Definition) remain similar but with slightly updated wording
- Step 6 is **new** -- targets `volume-section` and specifically explains the green/orange color semantics for Target Vol and Override Vol cards
- Step 7 (Employment Split) remains similar

#### `src/components/support/UserGuidesTab.tsx`
- Update the step count for the `staffing` tour from `8` to `7`

No other files need changes -- all `data-tour` attributes already exist in the codebase.

