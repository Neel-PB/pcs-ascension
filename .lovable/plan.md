

## Wire Planned/Active Resources to `GET /skill-shift` API

### Current State
`PositionPlanning.tsx` uses a hardcoded `varianceData` array (lines 83-233) with mock FTE numbers. The Hired/Active toggle applies fake variations via `applyActiveVariation`. Only `selectedDepartment` is passed as a prop.

### API Response Fields → `VarianceData` Mapping

The `GET /skill-shift` endpoint returns records per `skill_mix`, each with day/night/total breakdowns:

```text
API field              → VarianceData field
─────────────────────────────────────────
skill_mix              → skill
target_fte_day         → targetDay
target_fte_night       → targetNight
target_fte_total       → targetTotal
hired_day_fte          → hiredDay (Hired mode)
hired_night_fte        → hiredNight
hired_total_fte        → hiredTotal
active_day_fte         → hiredDay (Active mode)
active_night_fte       → hiredNight
active_total_fte       → hiredTotal
open_reqs_day_fte      → reqsDay
open_reqs_night_fte    → reqsNight
open_reqs_total_fte    → reqsTotal
(computed)             → varianceDay/Night/Total = target - hired/active - reqs
nursing_flag           → used to determine nursing/non-nursing
broader_skill_mix_category → used for skill group buckets
```

### Changes

**1. New hook: `src/hooks/useSkillShift.ts`**
- Fetch `GET /skill-shift` with filter query params: `region`, `market`, `businessUnit`, `departmentId`, `submarket`, `level2`, `pstat`, `nursingFlag`
- Same auth header pattern as `usePatientVolume`
- Handle paginated `{ data, total }` or flat array response
- Return raw records; let the component do the mapping

**2. `src/pages/staffing/StaffingSummary.tsx`**
- Pass all filter values to `PositionPlanning` (currently only passes `selectedDepartment`)

**3. `src/pages/staffing/PositionPlanning.tsx`**
- Accept full filter props (region, market, facility, department, submarket, level2, pstat)
- Call `useSkillShift` with those filters + `nursingFlag` based on `staffCategory`
- Map API records to `VarianceData[]`, computing variance as `target - hired - reqs`
- For **Hired** mode: use `hired_day_fte` / `hired_night_fte` / `hired_total_fte`
- For **Active** mode: use `active_day_fte` / `active_night_fte` / `active_total_fte`
- Use `broader_skill_mix_category` to dynamically build `skillGroups` instead of hardcoded list
- Compute TOTAL row by summing all skill rows
- Remove hardcoded `varianceData` and `applyActiveVariation`
- Show loading state while fetching

### Scope
3 files: new `useSkillShift.ts`, edit `StaffingSummary.tsx`, edit `PositionPlanning.tsx`

