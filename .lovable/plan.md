
# Fix Role-Based Filter Restrictions

## Problem Summary

Directors and Managers have their visible filters disabled because of cascading dependencies:

| Role | Filter Permissions | Current Issue |
|------|-------------------|---------------|
| Director | Facility, Department | Facility disabled (needs Market selected first, but no Market permission) |
| Manager | Department only | Department disabled (needs Facility selected first, but no Facility permission) |

The filter cascade logic requires parent selections, but restricted roles can't access those parent filters.

## Solution Overview

Implement organization-level access scoping that pre-populates filter values for restricted users based on their assigned locations.

---

## Part 1: Admin UI for Organization Access Assignment

Add a section in the User Form (Admin > Users > Edit) to assign specific locations to users:

- Market assignment (for CNO-level users)
- Facility assignment (for Director-level users)  
- Department assignment (for Manager-level users)

The UI will show a cascading selector where admins can pick:
1. Market (optional)
2. Facility (dependent on market)
3. Department (dependent on facility)

Multiple assignments can be added per user.

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/components/admin/UserFormSheet.tsx` | Add Organization Access section with multi-level selector |
| `src/components/admin/OrgAccessManager.tsx` | New component for managing user organization assignments |

---

## Part 2: Auto-Populate Filters for Restricted Users

When a user with restricted filter permissions loads the page:

1. Fetch their `user_organization_access` records
2. If they have a single assigned location, auto-select those filter values
3. If they have multiple locations, show a filtered dropdown with only their allowed options
4. If they have no assignments, show empty state prompting admin to configure access

### Filter Pre-Population Logic

```text
+------------------+----------------------------------------+
| Role             | Auto-Population Behavior               |
+------------------+----------------------------------------+
| Director         | Pre-select their assigned facility     |
|                  | Show only departments at that facility |
+------------------+----------------------------------------+
| Manager          | Pre-select their assigned facility     |
|                  | Pre-select their assigned department   |
+------------------+----------------------------------------+
| CNO              | Pre-select their assigned market       |
|                  | Show only facilities in that market    |
+------------------+----------------------------------------+
```

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useUserOrgAccess.ts` | Add method to get default filter values |
| `src/hooks/useFilterData.ts` | Add filtering based on org access restrictions |
| `src/pages/staffing/StaffingSummary.tsx` | Initialize filters from user's org access |
| `src/pages/positions/PositionsPage.tsx` | Initialize filters from user's org access |
| `src/components/staffing/FilterBar.tsx` | Handle restricted filter options |

---

## Part 3: Restrict Filter Options

For users with org access restrictions:

1. Hide "All Markets/Facilities/Departments" options
2. Only show locations they have access to
3. Auto-select if they only have one option
4. Lock (disable) filters if user has single assignment

### Example: Director with Single Facility

- Market filter: Hidden (no permission)
- Facility filter: Shows assigned facility, locked
- Department filter: Shows only departments at their facility

### Example: Director with Multiple Facilities

- Market filter: Hidden (no permission)
- Facility filter: Dropdown with only their assigned facilities
- Department filter: Cascades based on selected facility

---

## Part 4: Create Custom Hook for Org-Scoped Filters

Create a new hook that combines RBAC permissions with org access:

### New File: `src/hooks/useOrgScopedFilters.ts`

```typescript
// Combines filter permissions + org access restrictions
function useOrgScopedFilters() {
  const { getFilterPermissions } = useRBAC();
  const { orgAccess } = useUserOrgAccess(userId);
  
  return {
    // Initial values based on org access
    defaultFilters: { ... },
    
    // Available options (filtered by org access)
    availableMarkets: [...],
    availableFacilities: [...],
    availableDepartments: [...],
    
    // Which filters are locked (single assignment)
    lockedFilters: { market: false, facility: true, department: false },
  };
}
```

---

## Implementation Steps

### Step 1: Update User Form with Org Access Manager
- Add collapsible section below role selector
- Create OrgAccessManager component with market > facility > department cascade
- Save to user_organization_access table

### Step 2: Create useOrgScopedFilters Hook
- Fetch user's org access records
- Calculate default filter values
- Determine available options per filter level
- Identify locked filters

### Step 3: Update FilterBar Component
- Accept org access restrictions as props
- Disable locked filters (show value but prevent change)
- Filter dropdown options based on allowed locations
- Hide "All X" option when user has restrictions

### Step 4: Update Page Components
- Initialize filter state from useOrgScopedFilters defaults
- Pass restricted options to FilterBar

### Step 5: Test with Demo Users
- Create org access records for demo.director and demo.manager
- Verify filters auto-populate correctly
- Verify restricted dropdowns work

---

## Technical Details

### Database Table: user_organization_access

Already exists with schema:
- `id` (uuid)
- `user_id` (uuid, FK to profiles)
- `market` (text, optional)
- `facility_id` (text, optional)
- `facility_name` (text, optional)
- `department_id` (text, optional)
- `department_name` (text, optional)

### Filter Lock Visual Treatment

Locked filters will:
- Show the assigned value
- Have `disabled` state on the Select
- Display a lock icon to indicate it's fixed
- Tooltip explaining "Assigned by administrator"

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/admin/OrgAccessManager.tsx` | CREATE - New component for org access UI |
| `src/components/admin/UserFormSheet.tsx` | MODIFY - Add OrgAccessManager section |
| `src/hooks/useOrgScopedFilters.ts` | CREATE - New hook combining permissions + org access |
| `src/hooks/useUserOrgAccess.ts` | MODIFY - Add getDefaultFilters method |
| `src/hooks/useFilterData.ts` | MODIFY - Add filterByOrgAccess method |
| `src/components/staffing/FilterBar.tsx` | MODIFY - Handle locked filters and restricted options |
| `src/pages/staffing/StaffingSummary.tsx` | MODIFY - Initialize from org-scoped defaults |
| `src/pages/positions/PositionsPage.tsx` | MODIFY - Initialize from org-scoped defaults |

---

## Edge Cases

1. **No Org Access Assigned**: Show empty state message asking user to contact admin
2. **Multiple Roles with Different Access**: Union all accessible locations
3. **Admin Viewing**: No restrictions, all filters available
4. **Org Access Without Role Restriction**: Org access only applies when role lacks filter permissions
