

## Revert: Department Only Enabled When Facility Is Selected

The recent change enabled the department dropdown when a region or market was selected. Per your requirement, department should **only** be available when a specific facility is selected.

### Changes — `src/components/staffing/FilterBar.tsx`

**1. Revert `isDepartmentDisabled` (line 281-283)**:
```typescript
const isDepartmentDisabled = lockedFilters.department || 
  (!hasRestrictionAt('department') && selectedFacility === "all-facilities");
```

**2. Remove market/region-based department cascading (lines ~197-255)**:
Remove the two blocks that cascade departments from market and region selections. Keep only the existing facility-based and access-scope-restriction-based department logic.

The facility and region cascading for the **facility dropdown** stays intact — only department behavior changes.

