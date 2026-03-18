

## Fix: Vacancy Rate Donut Missing Skill Mix Entries

**Problem**: The donut chart groups any skill mix with hired FTEs below 3% of the total into an "Other" bucket, hiding individual entries. The horizontal bar shows all entries, so the donut appears to have less data.

**Solution**: Remove the 3% threshold for the Vacancy Rate donut. Show all skill mixes as individual slices since this is skill-mix-level data (not department-level where dozens of entries would clutter). Keep the "Other" grouping only if there are more than ~15 entries to prevent visual noise.

### Change in `src/components/staffing/KPIChartModal.tsx`

In the Vacancy Rate donut section (around line 756-764):
- Change the grouping logic: only apply the 3% threshold when there are more than 15 skill mixes; otherwise show all slices individually
- This ensures the donut always matches the horizontal bar data when the count is manageable

```
// Before
const threshold = total * 0.03;

// After  
const threshold = skillData.length > 15 ? total * 0.03 : 0;
```

One line change, one file.

