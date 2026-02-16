

## Expand Staffing Tour with KPI Card Interactions

### What Changes
Add 3 new tour steps after the existing KPI section steps to teach users about the interactive features on each KPI card:

**New Steps (inserted after step 5 "Productive Resources"):**

6. **KPI Chart View** -- Targets the first chart icon (BarChart3) on a KPI card. "Click the chart icon on any KPI card to view a detailed trend chart with historical data and breakdowns."
7. **KPI Definition View** -- Targets the first eye icon (Eye) on a KPI card. "Click the eye icon to see the KPI's definition and how it's calculated."
8. **Employment Type Split** -- Targets the green breakdown badge under Target FTEs. "This badge shows the FT/PT/PRN employment split. The target is 70/20/10. Click it to see current vs target variance."

Then the existing Workforce Drawer step becomes step 9.

### Technical Changes

#### 1. `src/components/staffing/DraggableKPISection.tsx`
- Add `data-tour="kpi-chart-action"` to the first KPI card's chart button
- Add `data-tour="kpi-info-action"` to the first KPI card's info button
- Add `data-tour="kpi-split-badge"` to the target FTEs green breakdown badge

Since the chart/eye icons are inside `KPICard.tsx`, we need to pass `data-tour` attributes through.

#### 2. `src/components/staffing/KPICard.tsx`
- Accept optional `dataTourChart?: string` and `dataTourInfo?: string` props
- Apply them to the chart button and info button respectively

#### 3. `src/components/staffing/DraggableKPISection.tsx` (badge)
- Add `data-tour="kpi-split-badge"` to the green target breakdown badge container (line ~96)
- Pass `dataTourChart="kpi-chart-action"` and `dataTourInfo="kpi-info-action"` only to the first KPI in the list that has chart data

#### 4. `src/components/tour/tourSteps.ts`
- Add 3 new steps between "Productive Resources" and "Workforce Drawer":

```
Step 6: KPI Chart View
  target: '[data-tour="kpi-chart-action"]'
  title: "KPI Trend Chart"
  content: "Click the chart icon on any KPI card to view detailed trend data, historical charts, and breakdowns by category."

Step 7: KPI Definition
  target: '[data-tour="kpi-info-action"]'
  title: "KPI Definition & Calculation"
  content: "Click the eye icon to see what this KPI measures and how it's calculated."

Step 8: Employment Type Split
  target: '[data-tour="kpi-split-badge"]'
  title: "Employment Type Split"
  content: "This shows the FT/PT/PRN staffing mix. The target is 70% Full-Time, 20% Part-Time, 10% PRN. Click to see current vs target variance."
```

### Result
The tour will be 9 steps total, walking users through filters, navigation, each KPI section, then zooming into individual card interactions (chart, definition, split), and finally the workforce drawer.
