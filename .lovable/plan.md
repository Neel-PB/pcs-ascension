

## Replace mock variance data with real skill-shift API data

### Problem
The Variance Analysis table currently generates random mock numbers via `generateVariance()`. The Position Planning tab already fetches real data from the `/skill-shift` API and computes variance as `target - hired - reqs`. We need to use that same data source in Variance Analysis, pivoted into the 5 skill columns.

### Column Mapping (broader_skill_mix_category → Variance Analysis column)
- **CL** → "CL"
- **RN** → "RN"
- **PCT** → "PCT"
- **HUC** → "Clerk" (in the API data, Clerk = HUC)
- **Overhead** → "Overhead"

### Approach

**File: `src/pages/staffing/VarianceAnalysis.tsx`**

1. **Add `useSkillShift` hook** — fetch data using the same filters already passed to the component (region, market, facility, department). Add the missing filter props (level2, pstat) to match the filter bar.

2. **Add a pivot function** `pivotSkillShiftToVariance(records, groupByField)` that:
   - Groups records by a geographic field (e.g. `market`, `business_unit`, `department_id`)
   - Within each group, aggregates records by `broader_skill_mix_category`
   - Maps each category to the corresponding column (CL→cl, RN→rn, PCT→pct, Clerk→huc, Overhead→overhead)
   - Computes variance per column as: `target_total - hired_total - open_reqs_total` (and similarly for day/night)
   - Returns `VarianceData[]` with the existing interface shape

3. **Replace `generateVariance()`** — All calls to `generateVariance()` in `dynamicMarkets`, `dynamicDepartments`, and the various `getData()` branches will use the pivoted skill-shift data instead. Each geographic entity (region, market, facility, department) gets its variance from the aggregated skill-shift records matching that entity.

4. **Update `getData()`** — For each hierarchy level:
   - **Departments** (facility selected): group skill-shift by `department_id`, join with department name
   - **Facilities** (market selected): group by `business_unit`, join with facility name
   - **Markets** (region selected): group by `market`
   - **Regions** (default): group by `region`, aggregate markets as children

5. **Add props** — Add `selectedLevel2` and `selectedPstat` props to `VarianceAnalysisProps` so the skill-shift query respects all filters.

6. **Loading state** — Show skeleton/spinner while skill-shift data is loading.

### What stays the same
- Table structure, columns (CL/RN/PCT/HUC/Overhead × Day/Night/Total), styling, expand/collapse, CSV download, fullscreen modal, access-scope enforcement logic — all unchanged.
- The `VarianceData` interface stays the same.
- Geographic grouping logic (submarket groups, region→market hierarchy) stays the same, just data values come from API instead of `Math.random()`.

