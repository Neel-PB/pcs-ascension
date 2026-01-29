
# Fix: Filters Not Working for Director and Other Roles

## Problem Summary

When logged in as Director, Manager, or other non-admin roles, the filter dropdowns at the top of Staffing and Positions pages don't appear or function correctly. Only Labor Team users can see and use all filters.

## Root Cause

This is caused by two separate systems not working together properly:

1. **RBAC Permissions** (controls which filters are visible)
   - Director role only has permission to see Facility and Department filters
   - Manager role only has permission to see the Department filter
   - Region and Market filters are hidden for these roles

2. **Access Scope** (controls which data the user can see)
   - These demo users have NO entries in the Access Scope table
   - This means they have unrestricted access to ALL data

When a filter is hidden due to RBAC permissions, the system keeps the default value of "all-regions" or "all-markets", which then shows ALL data instead of restricting it.

## Solution

The fix requires ensuring that when filters are hidden, the system still properly restricts data based on the user's assigned Access Scope. We need to:

### Step 1: Add Access Scope Assignments (Required)

Add entries to the `user_organization_access` table for Director and Manager demo users to restrict their data visibility:

- **Director** (demo.director@ascension.org): Assign to specific Facility(s)
- **Manager** (demo.manager@ascension.org): Assign to specific Department(s)

### Step 2: Update Filter Initialization Logic

Modify the filter initialization in `StaffingSummary.tsx` and `PositionsPage.tsx` to:

1. Check the user's Access Scope restrictions
2. For hidden filters (due to RBAC), auto-select the first restricted value instead of "all-*"
3. This ensures the data is filtered even when the dropdown isn't visible

### Step 3: Update Data Query Logic (Optional Enhancement)

Optionally add a safety check in data-fetching hooks to:
- Detect when a user has no visible filter for a level (Region/Market) but also no Access Scope restriction
- Log a warning or apply a default restriction to prevent showing ALL data

---

## Technical Changes

### File: `src/pages/staffing/StaffingSummary.tsx`

Update the filter initialization effect to account for hidden filters:

```typescript
// Current (lines 35-48):
useEffect(() => {
  if (!orgScopedLoading && !filtersInitialized && defaultFilters) {
    if (defaultFilters.market !== "all-markets") {
      setSelectedMarket(defaultFilters.market);
    }
    // ... etc
  }
}, [...]);

// Updated - also apply defaults for hidden filters:
useEffect(() => {
  if (!orgScopedLoading && !rbacLoading && !filtersInitialized && defaultFilters) {
    // For filters the user CAN'T see, force-apply Access Scope defaults
    const { region: canSeeRegion, market: canSeeMarket } = getFilterPermissions();
    
    // Always apply region default if user can't see the filter
    if (!canSeeRegion && defaultFilters.region !== "all-regions") {
      setSelectedRegion(defaultFilters.region);
    }
    
    // Always apply market default if user can't see the filter
    if (!canSeeMarket && defaultFilters.market !== "all-markets") {
      setSelectedMarket(defaultFilters.market);
    }
    
    // Apply other defaults as before
    if (defaultFilters.facility !== "all-facilities") {
      setSelectedFacility(defaultFilters.facility);
    }
    if (defaultFilters.department !== "all-departments") {
      setSelectedDepartment(defaultFilters.department);
    }
    
    setFiltersInitialized(true);
  }
}, [orgScopedLoading, rbacLoading, filtersInitialized, defaultFilters, getFilterPermissions]);
```

### File: `src/pages/positions/PositionsPage.tsx`

Apply the same pattern.

### Database: Add Access Scope Assignments

Run SQL to assign demo users to specific locations:

```sql
-- Assign Director to a specific facility
INSERT INTO user_organization_access (user_id, facility_id, facility_name)
SELECT '4f08a81b-af3e-4e91-98a4-8c742e8b585f', facility_id, facility_name
FROM facilities
WHERE facility_name = 'St. Vincent Indianapolis Hospital'
LIMIT 1;

-- Assign Manager to a specific department
INSERT INTO user_organization_access (user_id, department_id, department_name, facility_id, facility_name)
SELECT 
  '62150a21-3387-4f58-9dd0-f5cc85a8a421',
  d.department_id,
  d.department_name,
  f.facility_id,
  f.facility_name
FROM departments d
JOIN facilities f ON d.facility_id = f.facility_id
WHERE d.department_name = 'ICU'
LIMIT 1;
```

---

## Expected Outcome

After these changes:

| Role | Visible Filters | Data Shown |
|------|----------------|------------|
| Director | Facility, Department | Only data from assigned Facility |
| Manager | Department | Only data from assigned Department |
| Labor Team | All filters | All data (no restrictions) |

The filters that users can't see will be auto-populated from their Access Scope, ensuring they only see data they're authorized to view.
