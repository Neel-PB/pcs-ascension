

## Contextual KPI Walkthrough — "Drill-Down Sub-Steps"

### What This Pattern Is Called

This is called a **"Contextual Drill-Down Walkthrough"** or **"In-Context Action Discovery"** — where the tour teaches interactions (Chart button, View button) in the context of the first KPI card rather than as separate generic steps at the end.

### Current Flow (Problem)

```text
Step 8:  [Vacancy Rate card] -> "Percentage of positions unfilled"
Step 9:  [Target FTEs card] -> "FTEs needed for budgeted staffing"
Step 10: [Hired FTEs card] -> ...
...18 more KPI cards...
Step 26: [Chart button on first card] -> "Click chart icon to see trends"
Step 27: [Info button on first card] -> "Click eye icon to see definition"
```

The Chart and Info button steps come at the very end, disconnected from the KPI they belong to.

### New Flow (Solution)

```text
Step 8:  [Vacancy Rate card] -> "Percentage of positions unfilled"
Step 9:  [Chart button ON Vacancy Rate] -> "Click chart icon to see trends" + mini-chart preview
Step 10: [Info button ON Vacancy Rate] -> "Click eye icon to see definition" + info preview
Step 11: [Target FTEs card] -> "FTEs needed for budgeted staffing"
Step 12: [Hired FTEs card] -> ...
...remaining KPI cards (no chart/info sub-steps needed)...
```

The user learns about Chart and Info actions **immediately after seeing the first KPI card**, making the connection intuitive. The remaining cards don't repeat these sub-steps since the user already knows how to use them.

### Changes

**`src/components/tour/tourSteps.ts`**

1. Move the two existing steps (Trend Chart targeting `kpi-chart-action` and Definition targeting `kpi-info-action`) from their current position at the end of all KPI steps (lines 235-253) to directly after the Vacancy Rate step (after line 114)
2. No content changes needed — the same `demoContent` previews (mini-chart and kpi-info) remain
3. Total step count stays the same (steps just move position)
4. Update the step count in UserGuidesTab if applicable

**No other files need changes** — the `data-tour` attributes on the chart/info buttons already exist on the first KPI card via `DraggableKPISection.tsx`.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourSteps.ts` | Move Chart and Info button steps to directly after Vacancy Rate step |

