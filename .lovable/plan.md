

## Hide Vacancy Rate Chart for Non-Nursing Departments

### Problem
The Vacancy Rate KPI currently shows its chart icon regardless of whether the selected department is nursing or non-nursing. It should only show the chart for nursing departments.

### Change

**`src/pages/staffing/StaffingSummary.tsx`** — Line 509

Update the `chartData` for the `vacancy-rate` KPI to be gated by `hasNursingData`, same pattern already used for Target FTEs:

```typescript
// Before
chartData: vacancyBySkillMix.length > 0 
  ? vacancyBySkillMix.map(d => ({ name: d.name, value: d.hired })) 
  : [],

// After
chartData: hasNursingData && vacancyBySkillMix.length > 0 
  ? vacancyBySkillMix.map(d => ({ name: d.name, value: d.hired })) 
  : [],
```

This uses the existing `hasNursingData` flag (which checks `nursing_flag` from the skill-shift API) to hide the chart icon when a non-nursing department is selected — identical to how Target FTEs already works.

