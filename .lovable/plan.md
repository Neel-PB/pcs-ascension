

## Add Chart and Info Sub-Steps to Every KPI Card in the Tour

### What We're Doing

Instead of only showing the chart and info button steps once (on Vacancy Rate), every KPI card will get its own chart button and info button highlighted as individual tour steps. This creates a consistent "Card -> Chart -> Info" drill-down pattern for all 18 KPIs.

### Current vs New Flow

**Current (3 steps for first KPI, 1 step for rest):**
```text
Vacancy Rate card -> Chart button -> Info button -> Target FTEs card -> Hired FTEs card -> ...
```

**New (3 steps per KPI):**
```text
Vacancy Rate card -> Vacancy Rate chart -> Vacancy Rate info ->
Target FTEs card -> Target FTEs chart -> Target FTEs info ->
Hired FTEs card -> Hired FTEs chart -> Hired FTEs info ->
... (same pattern for all 18 KPIs)
```

### Impact on Step Count

- Current total: 32 steps
- Removing: 2 generic chart/info steps + text description from Vacancy Rate
- Adding: 2 sub-steps (chart + info) per KPI x 18 KPIs = 36 sub-steps
- New total: approximately 62 steps (30 existing non-KPI steps + 18 KPI cards + 18 chart steps + 18 info steps, minus the 2 old generic steps, minus the 12 steps that were already counted)

Actual math: 32 current - 2 old generic chart/info steps = 30 base + 18 chart + 18 info = 66 total. But we already have 18 KPI card steps, so: 30 non-KPI steps + 18 KPI cards + 36 chart/info sub-steps = 66 steps.

### Technical Changes

**1. `src/components/staffing/DraggableKPISection.tsx`** (lines 86-87)

Give every KPI card unique `data-tour` attributes for its chart and info buttons instead of only the first one:

```typescript
// FROM:
dataTourChart={isFirstWithChart ? "kpi-chart-action" : undefined}
dataTourInfo={isFirstWithChart ? "kpi-info-action" : undefined}

// TO:
dataTourChart={kpi.chartData?.length > 0 ? `kpi-${kpi.id}-chart` : undefined}
dataTourInfo={`kpi-${kpi.id}-info`}
```

**2. `src/components/tour/tourSteps.ts`**

- Remove the 2 old generic chart/info steps (targeting `kpi-chart-action` and `kpi-info-action`)
- Revert the Vacancy Rate content back to plain description (no emoji text)
- After each of the 18 KPI card steps, add 2 sub-steps targeting that KPI's chart and info buttons
- The first KPI (Vacancy Rate) chart step keeps the `mini-chart` demo preview; subsequent ones use a shorter text-only description
- The first KPI (Vacancy Rate) info step keeps the `kpi-info` demo preview; subsequent ones use shorter text

Example for each KPI:
```typescript
{
  target: '[data-tour="kpi-vacancy-rate"]',
  title: 'Vacancy Rate',
  content: 'Percentage of approved budgeted positions currently unfilled.',
  placement: 'bottom',
  disableBeacon: true,
},
{
  target: '[data-tour="kpi-vacancy-rate-chart"]',
  title: 'Vacancy Rate — Trend Chart',
  content: demoContent('Click the chart icon to view historical trends and breakdowns.', 'mini-chart'),
  placement: 'bottom',
  disableBeacon: true,
},
{
  target: '[data-tour="kpi-vacancy-rate-info"]',
  title: 'Vacancy Rate — Definition',
  content: demoContent('Click the eye icon to see the definition and calculation formula.', 'kpi-info'),
  placement: 'bottom',
  disableBeacon: true,
},
// Next KPI...
{
  target: '[data-tour="kpi-target-ftes"]',
  title: 'Target FTEs',
  content: '...',
  ...
},
{
  target: '[data-tour="kpi-target-ftes-chart"]',
  title: 'Target FTEs — Trend Chart',
  content: 'View the historical trend for Target FTEs.',
  ...
},
{
  target: '[data-tour="kpi-target-ftes-info"]',
  title: 'Target FTEs — Definition',
  content: 'See how Target FTEs is defined and calculated.',
  ...
},
```

Only the first chart/info steps use the rich `demoContent` preview. The rest use plain text to keep the tour moving quickly.

**3. `src/components/support/UserGuidesTab.tsx`** (line 40)

Update the `stepCount` for the staffing tour from 32 to the new total (66).

### Files Changed

| File | Change |
|------|--------|
| `src/components/staffing/DraggableKPISection.tsx` | Give every KPI unique `data-tour` chart and info attributes |
| `src/components/tour/tourSteps.ts` | Add chart and info sub-steps after each of the 18 KPI card steps |
| `src/components/support/UserGuidesTab.tsx` | Update stepCount from 32 to 66 |

