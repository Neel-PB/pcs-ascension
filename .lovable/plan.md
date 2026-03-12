

## Bug: Departments not showing for many business units

### Root Cause

In `transformFlatRows` (line 87-94 of `useFilterData.ts`), departments are deduplicated by `department_id` alone:

```typescript
if (row.department_id && !departmentMap.has(row.department_id)) {
  departmentMap.set(row.department_id, {
    ...
    facility_id: row.business_unit,  // only first business_unit is stored
  });
}
```

The same `department_id` can exist under **multiple** business units (facilities). Because we dedupe on `department_id` alone, only the **first** business_unit association is kept. When the user selects business_unit `74002`, `getDepartmentsByFacility("74002")` filters by `facility_id === "74002"` — but if those departments were first seen under a different business_unit, they won't match. Result: empty department list.

### Fix

**`src/hooks/useFilterData.ts`** — Change the department dedup key to a composite of `department_id + business_unit`:

```typescript
const deptKey = `${row.department_id}|${row.business_unit}`;
if (row.department_id && !departmentMap.has(deptKey)) {
  departmentMap.set(deptKey, {
    id: deptKey,
    department_id: row.department_id,
    department_name: row.department_description ?? row.department_id,
    facility_id: row.business_unit,
  });
}
```

This preserves all department-to-facility associations from the API data (which maps to the `all_market_table_ui_filter` table on the backend). A department appearing under 3 different business units will now create 3 entries, each correctly linked to its facility.

### Scope
Single file, ~4 lines changed.

