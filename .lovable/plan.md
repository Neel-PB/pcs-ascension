

## Update Vacancy Rate Step to Preview Chart and Info Actions

### Problem

Currently the Vacancy Rate step (step 10) only shows a plain description: "Percentage of approved budgeted positions currently unfilled." The user then encounters the Chart and Info button steps separately without prior context about what those icons do.

### Solution

Replace the plain text content of the Vacancy Rate step with a richer description that tells the user what both the chart icon and eye icon do — connecting them to the next two drill-down steps. The content should mention:
- What the KPI measures (brief)
- The chart icon opens a trend chart with historical data
- The eye icon shows the definition and calculation formula

### Changes

**`src/components/tour/tourSteps.ts`** (lines 109-115)

Update the Vacancy Rate step content from:

```
content: 'Percentage of approved budgeted positions currently unfilled.'
```

To something like:

```
content: 'Percentage of approved budgeted positions currently unfilled.\n\nUse the 📊 chart button to view historical trends, or the 👁 eye button to see the full definition and calculation formula. Every KPI card has these actions.'
```

This keeps the KPI description but adds actionable context about the two buttons, so when the tour highlights them individually in the next two steps, the user already understands the purpose.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourSteps.ts` | Update Vacancy Rate step content to mention chart and eye button actions |

