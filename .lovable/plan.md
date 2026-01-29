
# Fix Forecast Tab Department Filter Not Working

## Problem

When a department like "CCU" is selected without a specific facility, the Forecast tab shows "No forecast data available" because:

1. The FilterBar uses `department_name` (e.g., "CCU") as the selected value when no facility is chosen
2. The `useForecastBalance` hook filters by `departmentId` column (e.g., "14453")
3. These values don't match, so no data is returned

## Root Cause Analysis

In `FilterBar.tsx` (lines 134-137):
```typescript
: uniqueDepartmentNames.map(name => ({
    department_id: name,     // Uses NAME as ID
    department_name: name
  }));
```

But in `useForecastBalance.ts`:
```typescript
if (departmentId) employedQuery = employedQuery.eq('departmentId', departmentId);
```

The query uses `.eq('departmentId', 'CCU')` but the actual column value is "14453".

---

## Solution

Update `useForecastBalance` to filter by **departmentName** when the filter value matches a department name pattern, or add a separate filter for `departmentName`.

The safest approach: Filter by `departmentName` using `.ilike()` instead of filtering by `departmentId`, since the FilterBar can pass either the numeric ID (when facility is selected) or the name (when no facility is selected).

---

## Technical Changes

| File | Change |
|------|--------|
| `src/hooks/useForecastBalance.ts` | Change department filtering logic to handle both ID and name patterns |

---

## Implementation Details

Detect whether the filter value is a numeric ID or a department name, then filter accordingly:

```typescript
// Department filter - could be ID (numeric) or name (string)
if (departmentId) {
  // If it looks like a numeric ID, filter by departmentId
  // Otherwise, filter by departmentName (case-insensitive)
  if (/^\d+$/.test(departmentId)) {
    employedQuery = employedQuery.eq('departmentId', departmentId);
  } else {
    employedQuery = employedQuery.ilike('departmentName', departmentId);
  }
}
```

Apply the same logic to both the employed positions query and the open requisitions query.

---

## Expected Result

| Scenario | Before | After |
|----------|--------|-------|
| Select "CCU" with no facility | No data shown | CCU data displayed |
| Select "CCU" with facility selected | Works (uses numeric ID) | Works (uses numeric ID) |
| KPI totals | Show zeros | Reflect filtered department data |
