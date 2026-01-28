
# Fix Filter Bar Enabling and Organization Access Logic

## Problem Summary

Currently, filters are **disabled** when parent filters aren't selected:
- Facility filter is disabled when Market = "all-markets"
- Department filter is disabled when Facility = "all-facilities"

This breaks for Directors/Managers who don't have access to parent filters. They see disabled dropdowns that can't be used.

**What you actually want:**
1. All visible filters should be **ENABLED by default** for all users
2. Organization access should be **flat, not hierarchical** - users can be assigned to any combination of regions, markets, facilities, or departments
3. If user has no org access → show all options (no restrictions)
4. If user has org access → only show their assigned items in the dropdown (but filter remains enabled)

---

## Changes Required

### 1. Remove Filter Cascade Disable Logic

**File:** `src/components/staffing/FilterBar.tsx`

Current problematic code (lines 124-134):
```tsx
// This logic DISABLES filters - we need to REMOVE it
const isFacilityDisabled = hasRestrictions 
  ? lockedFilters.facility 
  : selectedMarket === "all-markets";
  
const isDepartmentDisabled = hasRestrictions
  ? lockedFilters.department
  : selectedFacility === "all-facilities";
```

**Change to:** Only disable if user has a single assigned option (locked):
```tsx
// Only lock when user has exactly ONE option (no choice to make)
const isFacilityDisabled = lockedFilters.facility;
const isDepartmentDisabled = lockedFilters.department;
```

### 2. Update Organization Access to Flat Structure

**File:** `src/hooks/useUserOrgAccess.ts`

Change the data structure from hierarchical (market → facility → department) to flat:
```typescript
interface OrgAccessFlat {
  regions: string[];
  markets: string[];
  facilityIds: string[];
  departmentIds: string[];
}
```

Each level is independent - a user can have access to:
- Department "D1" without being assigned to its parent Facility
- Facility "F1" without being assigned to its parent Market

### 3. Update OrgScopedFilters Hook

**File:** `src/hooks/useOrgScopedFilters.ts`

- Change logic to work with flat structure
- For each filter level, check if user has any restrictions at that level
- If they have restrictions, filter the dropdown to only show those items
- Never disable filters (only lock if single option)

### 4. Update Admin UI for Flat Multi-Select

**File:** `src/components/admin/OrgAccessManager.tsx`

Change from cascading single-selects to multi-select checkboxes:
- Region multi-select (optional)
- Market multi-select (optional)
- Facility multi-select (optional)
- Department multi-select (optional)

Each level is independent - admin can assign any combination.

---

## Filter Behavior Matrix

| User Has Org Access? | Filter Behavior |
|---------------------|-----------------|
| No records | Shows ALL options, filter enabled |
| 1 item at level | Pre-selected, filter locked (disabled) |
| 2+ items at level | Dropdown shows only those items, filter enabled |
| 0 items at level | Shows ALL options at that level (no restriction) |

### Example: Director with Org Access

**Org Access Records:**
- Facility: "Hospital A", "Hospital B"
- Department: "ICU", "ER", "Med Surg"

**Filter Behavior:**
- Region filter: Not visible (no RBAC permission)
- Market filter: Not visible (no RBAC permission)
- Facility filter: Shows only "Hospital A" and "Hospital B" (enabled, can select)
- Department filter: Shows only "ICU", "ER", "Med Surg" (enabled, can select)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/staffing/FilterBar.tsx` | Remove cascade disable logic |
| `src/hooks/useUserOrgAccess.ts` | Change to flat structure |
| `src/hooks/useOrgScopedFilters.ts` | Update for flat access model |
| `src/components/admin/OrgAccessManager.tsx` | Multi-select UI for each level |
| `src/pages/staffing/StaffingSummary.tsx` | Remove market-dependent facility logic |
| `src/pages/positions/PositionsPage.tsx` | Remove market-dependent facility logic |

---

## Database: user_organization_access Table

The existing table structure supports this flat model:
- Each row can have any combination of `market`, `facility_id`, `department_id`
- A user can have multiple rows with different combinations
- Query will extract unique values at each level independently

---

## Technical Details

### New Flat Access Structure

```typescript
interface OrgAccessFlat {
  // Each array contains independently assigned items
  regions: string[];        // User can access these regions
  markets: string[];        // User can access these markets  
  facilities: Facility[];   // User can access these facilities
  departments: Department[]; // User can access these departments
  
  // Quick lookup
  hasRegionRestriction: boolean;
  hasMarketRestriction: boolean;
  hasFacilityRestriction: boolean;
  hasDepartmentRestriction: boolean;
}
```

### Filter Dropdown Logic

```typescript
// For each filter level:
function getAvailableOptions(level: 'market' | 'facility' | 'department') {
  const orgAccess = useOrgScopedFilters();
  
  // If user has restrictions at this level, return only their assigned items
  if (orgAccess.hasRestrictionAt(level)) {
    return orgAccess.getRestrictedOptions(level);
  }
  
  // Otherwise, return all options
  return getAllOptions(level);
}
```

---

## Summary

1. **Filters are never disabled** except when locked (single option)
2. **Organization access is flat** - each level independent
3. **Dropdowns show restricted options** when user has org access
4. **Admin UI uses multi-select** for each level independently
