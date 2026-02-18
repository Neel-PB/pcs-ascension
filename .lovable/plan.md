

## Consolidate KPI Tour into Single "All-in-One" Steps

### What We're Doing

Replace the current 3-step pattern (Card -> Chart -> Info) with a single step per KPI that includes:
1. The KPI description text
2. A visual wireframe connecting the chart icon to "opens trend chart" and the eye icon to "opens definition/calculation"

This reduces the tour from 66 steps back to ~30, while teaching users about both buttons in context.

### Visual Concept

Each KPI tour tooltip will look like:

```text
+--------------------------------------+
| Vacancy Rate              10 of 30   |
+--------------------------------------+
| Percentage of approved budgeted      |
| positions currently unfilled.        |
|                                      |
| +----------------------------------+ |
| |  [chart icon] --> Trend Chart    | |
| |  View 12-month historical trends | |
| |  and breakdowns by skill type.   | |
| |                                  | |
| |  [eye icon] --> Definition       | |
| |  See the formula and how this    | |
| |  metric is calculated.           | |
| +----------------------------------+ |
|                                      |
| [Skip]            [Back]  [Next]     |
+--------------------------------------+
```

The wireframe uses the actual BarChart3 and Eye icons from the app, with arrow connectors pointing to their function labels.

### Technical Changes

**1. `src/components/tour/TourDemoPreview.tsx`**

Add a new variant called `kpi-actions` that renders a compact wireframe with two rows:
- Row 1: BarChart3 icon + arrow + "Trend Chart" label + short description
- Row 2: Eye icon + arrow + "Definition" label + short description

The component will accept an optional `config.hasChart` boolean (defaults to true) to handle KPIs without chart data (like some volume KPIs). When `hasChart` is false, only the eye/definition row shows.

```typescript
const KPIActions = ({ hasChart = true }: { hasChart?: boolean }) => (
  <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
    {hasChart && (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-accent">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-xs">--></span>
        <div>
          <div className="text-xs font-semibold text-foreground">Trend Chart</div>
          <div className="text-[10px] text-muted-foreground">View 12-month historical trends and breakdowns.</div>
        </div>
      </div>
    )}
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-7 h-7 rounded bg-accent">
        <Eye className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="text-muted-foreground text-xs">--></span>
      <div>
        <div className="text-xs font-semibold text-foreground">Definition</div>
        <div className="text-[10px] text-muted-foreground">See how this metric is defined and calculated.</div>
      </div>
    </div>
  </div>
);
```

Add `'kpi-actions'` to the `TourDemoVariant` type union and the switch statement.

**2. `src/components/tour/tourSteps.ts`**

- Remove all 36 individual chart/info sub-steps (the `kpi-*-chart` and `kpi-*-info` steps)
- Update each of the 18 KPI card steps to use `demoContent()` with the new `kpi-actions` variant instead of plain text descriptions

Example for Vacancy Rate:
```typescript
{
  target: '[data-tour="kpi-vacancy-rate"]',
  title: 'Vacancy Rate',
  content: demoContent(
    'Percentage of approved budgeted positions currently unfilled.',
    'kpi-actions',
    { hasChart: true }
  ),
  placement: 'bottom',
  disableBeacon: true,
},
```

Example for a volume KPI without chart data:
```typescript
{
  target: '[data-tour="kpi-override-vol"]',
  title: 'Override Volume',
  content: demoContent(
    'Manually set volume that supersedes the target. Orange border means it is active.',
    'kpi-actions',
    { hasChart: false }
  ),
  placement: 'bottom',
  disableBeacon: true,
},
```

**3. `src/components/support/UserGuidesTab.tsx`**

Update the `stepCount` from 66 back to 30 (the original count minus the 2 old generic steps: 32 - 2 = 30).

**4. `src/components/staffing/DraggableKPISection.tsx`**

The per-KPI `dataTourChart` and `dataTourInfo` attributes can stay as-is (they don't hurt anything and the KPI card buttons still need them for accessibility). No changes needed here.

### Step Count

- 7 filter steps + 1 tab nav + 1 KPI sections overview + 18 KPI cards + remaining non-KPI steps = ~30 total steps

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | Add `kpi-actions` variant with chart/eye icon wireframe |
| `src/components/tour/tourSteps.ts` | Remove 36 chart/info sub-steps, update 18 KPI steps to use `kpi-actions` demo content |
| `src/components/support/UserGuidesTab.tsx` | Update stepCount from 66 to 30 |
