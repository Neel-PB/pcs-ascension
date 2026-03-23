

## Remove Filter Locking — Use Restriction Instead of Disabling

### Problem
When a user has access to only 1 region (or 1 market/facility/department), the filter gets **disabled** with a lock icon. The user cannot interact with it at all. Instead, filters should always remain **enabled and interactive**, but only show the restricted options in the dropdown. If there's only 1 option, it should be pre-selected but the dropdown should still open (showing just that one item).

### Changes

#### 1. `src/components/staffing/FilterBar.tsx`

**Lines 278-284** — Remove all lock-based disabling. Filters should never be disabled due to access scope restrictions:

```typescript
// Before
const isRegionDisabled = lockedFilters.region;
const isMarketDisabled = lockedFilters.market;
const isFacilityDisabled = lockedFilters.facility;
const isDepartmentDisabled = lockedFilters.department || 
  (!hasRestrictionAt('department') && selectedFacility === "all-facilities");

// After
const isRegionDisabled = false;
const isMarketDisabled = false;
const isFacilityDisabled = false;
const isDepartmentDisabled = !hasRestrictionAt('department') && selectedFacility === "all-facilities";
```

- Region/Market/Facility: never disabled — restricted options already limit what's shown in the dropdown
- Department: only disabled when no facility is selected AND user has no department-level access scope (existing cascading logic)
- Lock icons will naturally disappear since the `isXDisabled` flags drive their visibility

#### 2. `src/hooks/useOrgScopedFilters.ts`

**Lines ~150-155** — Remove the `lockedFilters` logic that marks single-option levels as locked. Set all to `false`:

```typescript
lockedFilters: {
  region: false,
  market: false,
  facility: false,
  department: false,
},
```

This ensures no filter is ever marked as locked. The restriction is enforced by limiting the **options** in the dropdown, not by disabling the control.

### Result
- Filters with 1 allowed option: pre-selected, clickable, dropdown opens showing that single item
- Filters with multiple allowed options: pre-selected to "All X", dropdown shows only allowed items
- No lock icons, no disabled state from access scope

### Files Changed
- `src/components/staffing/FilterBar.tsx`
- `src/hooks/useOrgScopedFilters.ts`

