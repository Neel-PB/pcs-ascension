
# Use Unique Lists for Filter Dropdowns

## Problem

The filter dropdowns show duplicate entries when displaying "all" options:
- **Departments**: "ICU" appears 14 times, "Medical Surgical" appears 14 times, etc.
- This happens because departments with the same name exist at different facilities

When no parent filter is selected (e.g., no facility selected for departments), users see all records which includes duplicates by name.

## Solution

Deduplicate filter options by name when showing the full list. When a parent filter IS selected, show the filtered records (which may still have unique IDs).

### Strategy

| Filter | When to deduplicate |
|--------|-------------------|
| Region | Never - already unique |
| Market | Never - already unique |
| Facility | Never - already unique names |
| Department | When `selectedFacility === "all-facilities"` |

For departments, when no facility is selected:
- Extract unique department **names** from the full list
- Display as a simple list of unique names
- When user selects one, filter by that **name** across all facilities

### Code Changes

**FilterBar.tsx** - Deduplicate department options when showing all:

```tsx
// Get unique department names when no facility is selected
const uniqueDepartmentNames = useMemo(() => {
  const names = new Set<string>();
  allDepartments.forEach(d => names.add(d.department_name));
  return Array.from(names).sort();
}, [allDepartments]);

// For department display:
const availableDepartments = hasRestrictionAt('department')
  ? restrictedOptions.availableDepartments
  : selectedFacility !== "all-facilities"
    ? getDepartmentsByFacility(selectedFacility)  // Filtered - show actual records
    : uniqueDepartmentNames.map(name => ({        // All - show unique names
        department_id: name,  // Use name as ID for filtering
        department_name: name
      }));
```

**Note**: When filtering by a department name (not ID), the data queries will need to match by `department_name` instead of `department_id`. This already works because positions are typically filtered by department name, not ID.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/staffing/FilterBar.tsx` | Add deduplication logic for departments when showing all |

## Benefits

1. **Clean dropdown** - No more seeing "ICU" 14 times
2. **Faster selection** - Users quickly find the department they want
3. **Correct behavior** - When facility IS selected, shows facility-specific departments

## Technical Notes

The change uses `useMemo` to efficiently compute unique names only when `allDepartments` changes, preventing unnecessary recalculations on each render.
