

## Fix: Nursing/Non-Nursing toggle not updating on department change

### Root Cause

The `useDepartmentCategory` hook queries by `department_id` alone, but the `departments` table has only 98 rows. Many departments from the external filter API likely don't exist in this table. When a department isn't found, `.maybeSingle()` returns `null`, so `departmentIsNursing` stays `null` and the `useEffect` never updates `staffCategory`.

Additionally, duplicate `department_id` across facilities (e.g., `18551`) would cause `.maybeSingle()` to error.

### Solution: Derive nursing status from the skill-shift API data itself

Instead of relying on the limited `departments` table, determine nursing status by making **two quick API calls** — one with `nursingFlag=Y` and one with `nursingFlag=N` — or better yet, skip the DB lookup entirely and **always fetch both nursing and non-nursing data**, then let the data tell us what the department is.

**Simpler approach**: Fix `useDepartmentCategory` to also filter by `facility_id` (since facility is always selected before department), AND add a fallback: if the department isn't in the DB, fetch skill-shift with no `nursingFlag` filter and check the `nursing_flag` field on the returned records.

### Changes

#### 1. `src/hooks/useDepartmentCategory.ts`
- Accept `facilityId` as second parameter
- Filter by both `department_id` AND `facility_id` for unique results
- This fixes the duplicate department issue

#### 2. `src/pages/staffing/PositionPlanning.tsx`
- Pass `selectedFacility` to `useDepartmentCategory`
- When `departmentIsNursing` is `null` but a department IS selected, don't filter by `nursingFlag` in the skill-shift call — instead fetch all data and derive the category from the returned records' `nursing_flag` field
- When we get skill-shift data back and a department is selected but category is unknown, auto-detect: if all records have `nursing_flag=Y`, set nursing; if all `N`, set non-nursing; if mixed, default to nursing

This removes the dependency on the `departments` table having complete data and uses the actual API data as the source of truth.

### Scope
Two files changed. No database migrations needed.

