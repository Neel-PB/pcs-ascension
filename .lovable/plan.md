

## Change Vacancy Rate Charts from Department to Skill Mix

Since users typically have a single department selected, grouping vacancy data by department produces just one bar. The data should instead be grouped by **skill mix** (RN, PCT, Clinical Lead, etc.) which provides meaningful breakdown within a department.

### Changes

**1. `src/pages/staffing/StaffingSummary.tsx`**
- Rename `vacancyByDept` → `vacancyBySkillMix`
- Change aggregation key from `r.department_description` to `r.skill_mix || 'Unknown'`
- Update the reference in the vacancy-rate KPI config `chartData`

**2. `src/components/staffing/KPIChartModal.tsx`**
- Update all three option headers from "by Department" to "by Skill Mix":
  - Option A: "Horizontal Bar — Vacancy Rate % by Skill Mix"
  - Option B: "Stacked Bar — Hired FTEs + Vacancy Gap by Skill Mix"
  - Option C: "Grouped Bar — Hired vs Target FTEs by Skill Mix"

No structural changes to charts — same Recharts components, same color-coding logic, just different grouping key and labels.

