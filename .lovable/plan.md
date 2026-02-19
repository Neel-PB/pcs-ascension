

## Compact KPI-Specific Tour Previews

### What Changes

Replace the generic "kpi-actions" wireframe (which shows the same placeholder chart and definition for every KPI) with a **KPI-specific compact preview** that displays each KPI's own data from `kpiConfigs.ts` -- its own chart shape, definition, and calculation.

### Layout: Wide and Compact

Instead of the current tall vertical layout (icon + trend chart stacked above icon + definition), use a **horizontal two-column layout** inside a wider tooltip:

```text
+--------------------------------------------------------------+
| Vacancy Rate                                           10/30 |
| Percentage of approved budgeted positions currently unfilled. |
|                                                              |
| +---------------------------+  +---------------------------+ |
| | Trend Chart               |  | Definition                | |
| | [actual vacancy rate      |  | Percentage of approved    | |
| |  area chart using         |  | positions unfilled.       | |
| |  KPI's own data points]   |  |                           | |
| |                           |  | Calculation               | |
| | High: 16.0  Avg: 14.9    |  | (Target - Hired) /       | |
| | Low: 13.9                 |  |  Target x 100            | |
| +---------------------------+  +---------------------------+ |
|                                                              |
| Summary . 1 of 15      Skip All  Skip Section  Back  [Next] |
+--------------------------------------------------------------+
```

- Tooltip width increases from `max-w-[420px]` to `max-w-[560px]` (only for KPI steps via a data flag)
- Chart and Definition sit side by side, each taking ~50% width
- Chart uses the KPI's actual data points from `kpiConfigs.ts`
- Definition shows the real definition + calculation text

### Files to Change

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | Add new `KPICompactPreview` component that accepts `kpiId` prop, looks up real data from `kpiConfigs.ts`, renders a two-column layout with the KPI's own mini chart (left) and definition+calculation (right) |
| `src/components/tour/tourSteps.ts` | Update all 18 KPI steps to use new `'kpi-compact'` variant with `{ kpiId: 'vacancy-rate' }` etc., passing each KPI's actual ID |
| `src/components/tour/TourTooltip.tsx` | Add conditional wider width when step has `data.wideTooltip: true` -- change card class from `max-w-[420px]` to `max-w-[560px]` for those steps |

### Technical Details

**KPICompactPreview component:**
- Imports `getFTEKPIs`, `getVolumeKPIs`, `getProductivityKPIs` from `kpiConfigs.ts`
- Looks up the matching KPI config by `kpiId`
- Left column: SVG area chart rendered from the KPI's own `chartData` array (last 12 points), with High/Avg/Low stats below
- Right column: Definition text + Calculation in a mono code block
- Both columns are compact with `text-[10px]` sizing

**Tour step changes (example):**
```typescript
// Before
{
  target: '[data-tour="kpi-vacancy-rate"]',
  title: 'Vacancy Rate',
  content: demoContent('Percentage of approved...', 'kpi-actions', { hasChart: true }),
}

// After
{
  target: '[data-tour="kpi-vacancy-rate"]',
  title: 'Vacancy Rate',
  content: demoContent('Percentage of approved...', 'kpi-compact', { kpiId: 'vacancy-rate' }),
  data: { wideTooltip: true },
}
```

**Tooltip width logic:**
```typescript
const isWide = (step as any).data?.wideTooltip;
// Card className changes to:
className={`${isWide ? 'max-w-[560px] min-w-[480px]' : 'max-w-[420px] min-w-[340px]'} ...`}
```

This approach reuses all existing KPI config data, keeps the tooltip compact by going horizontal, and gives each KPI its own unique preview matching what users see when they click the chart/info icons on the actual cards.
