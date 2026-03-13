

## Wire FTE KPIs to Skill-Shift API Data

### Current State
The 5 FTE KPI cards (Vacancy Rate, Hired FTEs, Target FTEs, FTE Variance, Open Reqs, Req Variance) in Staffing Summary use hardcoded mock values.

### Data Sources
- **Skill-Shift API** (`useSkillShift`): provides `hired_total_fte`, `target_fte_total`, `open_reqs_total_fte` per record
- **Productive Resources KPI API** (`useProductiveResourcesKpi`): provides `target_fte` per record (for non-nursing departments)

### Plan

**1. Add `useSkillShift` to `StaffingSummary.tsx`**
- Import and call the hook with the same filter set (region, market, facility, department, submarket, level2, pstat)
- No `nursingFlag` filter — fetch all records to get both nursing and non-nursing

**2. Aggregate skill-shift data**
- Sum `hired_total_fte` → Hired FTEs
- Sum `open_reqs_total_fte` → Open Reqs
- Sum `target_fte_total` (nursing records only, where `nursing_flag === 'Y'` or `true`) → nursing target

**3. Target FTEs = nursing target (skill-shift) + non-nursing target (productive-resources-kpi)**
- From productive-resources-kpi: sum `target_fte` where `nursing_flag === false` → non-nursing target
- Combined: `targetFtes = nursingTarget + nonNursingTarget`

**4. Derived KPIs**
- **FTE Variance** = Target FTEs − Hired FTEs
- **Req Variance** = FTE Variance − Open Reqs
- **Vacancy Rate** = (FTE Variance / Target FTEs) × 100

**5. Wire values into `fteKPIs` useMemo**
- Replace all 5 hardcoded values with computed values
- Show "—" while loading

### Files Modified
- `src/pages/staffing/StaffingSummary.tsx` — import `useSkillShift`, add aggregation logic, replace hardcoded FTE KPI values

