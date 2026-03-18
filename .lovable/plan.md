

## Simplify FTE KPI Charts to Donut-Only with Skill Shift Breakdown

**Goal**: For the 4 FTE KPIs — Vacancy Rate, Hired FTEs, Target FTEs, Open Reqs — show only a single donut chart with skill shift breakdown. Remove the multi-option view.

### Current State
- **Hired FTEs, Target FTEs, Open Reqs**: Already use `chartType: "pie"` with skill mix data → renders as donut via the standard `isPie` path. No changes needed.
- **Vacancy Rate**: Uses `showAllOptions: true` + `chartType: "bar"` → renders the expanded 3-option view (horizontal bar, donut, etc.). This needs to change.

### Changes

**`src/pages/staffing/StaffingSummary.tsx`** (Vacancy Rate KPI config, ~lines 452-458):
- Change `chartType` from `"bar"` to `"pie"`
- Remove `showAllOptions: true`
- Reshape `chartData` to use `hired` FTEs as the donut `value` (consistent with the existing skill mix donut that shows hired FTE distribution by skill)

```typescript
// Before
chartData: vacancyBySkillMix.length > 0 ? vacancyBySkillMix : ...,
chartType: "bar" as const,
showAllOptions: true,

// After
chartData: vacancyBySkillMix.length > 0 
  ? vacancyBySkillMix.map(d => ({ name: d.name, value: d.hired })) 
  : [],
chartType: "pie" as const,
```

This routes Vacancy Rate through the existing donut renderer in KPIChartModal (the `isPie` branch at ~line 845), which already handles donut + side legend + center total.

**No changes to KPIChartModal.tsx** — the existing pie/donut rendering path handles everything.

