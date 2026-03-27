

## Hide Variance Analysis Tab for Director & Manager Roles

### Problem
The Variance Analysis tab is currently visible to all roles, but Directors and Managers should not have access to it.

### Approach
Add a new permission key `staffing.variance` to the hardcoded RBAC config (no DB migration needed — the system uses hardcoded defaults with DB overrides). Gate the tab behind a permission check.

### Changes

**1. `src/config/rbacConfig.ts`**
- Add `staffing.variance` to `CORE_PERMISSIONS` array (category: "modules")
- Add `staffing.variance` to `PERMISSION_CATEGORIES.modules`
- Add it to `DEFAULT_ROLE_PERMISSIONS` for `admin`, `labor_team`, `leadership` (and legacy equivalents)
- Do NOT add it to `director` or `manager`
- Add to `PermissionKey` type

**2. `src/pages/staffing/StaffingSummary.tsx`**
- Import `hasPermission` from the RBAC hook
- Conditionally include the "Variance Analysis" tab only when the user has `staffing.variance` permission

### No DB migration needed
Core permissions are hardcoded. The `role_permissions` table only stores admin overrides. Adding to `CORE_PERMISSIONS` + `DEFAULT_ROLE_PERMISSIONS` is sufficient.

### Files Modified
1. `src/config/rbacConfig.ts` — add `staffing.variance` permission key and default assignments
2. `src/pages/staffing/StaffingSummary.tsx` — conditionally render Variance Analysis tab

