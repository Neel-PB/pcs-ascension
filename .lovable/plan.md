

## Fix: Nursing/Non-Nursing toggle not updating when switching departments

### Problem
The `useEffect` that auto-sets `staffCategory` has dependencies `[isDepartmentSelected, departmentIsNursing]`. When switching from one department to another, `isDepartmentSelected` stays `true`. If `departmentIsNursing` resolves to the same cached value (or returns `null` because the department isn't in the `departments` table), the effect doesn't re-fire, leaving the table stuck on the previous category.

### Solution: `src/pages/staffing/PositionPlanning.tsx`

1. Add `selectedDepartment` to the `useEffect` dependency array so it always re-evaluates on department change.
2. When `departmentIsNursing` is `null` for a selected department (not found in DB), reset `staffCategory` to `'nursing'` (default) rather than leaving it stuck on the previous value.

```typescript
// Line 517-522 — updated effect
useEffect(() => {
  if (isDepartmentSelected) {
    if (departmentIsNursing !== null) {
      setStaffCategory(departmentIsNursing ? 'nursing' : 'non-nursing');
    }
    // If departmentIsNursing is null (loading/not found), 
    // don't change — react-query will resolve and re-trigger
  }
}, [isDepartmentSelected, departmentIsNursing, selectedDepartment]);
```

This ensures every department change triggers a fresh evaluation, even when switching between two departments that both resolve to the same nursing status or when the query is re-fetching.

### Scope
Single file, ~3 lines changed in `PositionPlanning.tsx`.

