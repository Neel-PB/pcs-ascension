
# Complete RBAC Implementation Plan

## Overview

This plan implements a comprehensive Role-Based Access Control (RBAC) system with:
1. A new "Roles" admin panel with accordion-based UI for managing role permissions
2. Hybrid permission storage (hardcoded defaults + database overrides)
3. Filter-level access control for each role
4. Module access restrictions

---

## Role-Permission Matrix Summary

| Role | Filters | Sub-filters | Excluded Features |
|------|---------|-------------|-------------------|
| **Admin** | All | All | None |
| **Labor Management** | All | All | None |
| **Leadership** | All | All | Admin, Feedback, Volume/NP Settings |
| **CNO** | All or Market onwards (configurable) | All | Admin, Feedback, Volume/NP Settings |
| **Director** | Facility → Department | None | Admin, Feedback, Volume/NP Settings |
| **Manager** | Department only | None | Admin, Feedback, Volume/NP Settings |

---

## Implementation Tasks

### Phase 1: Database Changes

**1.1 Rename 'nurse_manager' to 'manager' in app_role enum**
- Add new 'manager' value to enum
- Update existing records from 'nurse_manager' to 'manager'
- Update code references

**1.2 Create role_permissions table for database overrides**
```text
┌─────────────────────────────────────────┐
│ role_permissions                        │
├─────────────────────────────────────────┤
│ id (uuid, PK)                          │
│ role (app_role)                        │
│ permission_key (text)                  │
│ permission_value (jsonb)               │
│ created_at (timestamptz)               │
│ updated_at (timestamptz)               │
└─────────────────────────────────────────┘
```

RLS Policies:
- Admins can manage (INSERT, UPDATE, DELETE)
- Authenticated users can SELECT

---

### Phase 2: Permission Configuration

**2.1 Create permission configuration file** (`src/config/rbacConfig.ts`)

Define all permissions organized by category:

```text
PERMISSION CATEGORIES:

1. Module Access
   - admin.access
   - feedback.access
   - staffing.access
   - positions.access
   - analytics.access
   - reports.access
   - support.access

2. Settings Access
   - settings.volume_override
   - settings.np_override

3. Filter Access Levels
   - filters.region
   - filters.market
   - filters.facility
   - filters.department

4. Sub-filter Access
   - filters.submarket
   - filters.level2
   - filters.pstat
```

**2.2 Define default role permissions**

Hardcoded defaults that serve as the base:

- **admin**: All permissions
- **labor_team**: All permissions (including admin/feedback/settings)
- **leadership**: All except admin, feedback, settings.volume_override, settings.np_override
- **cno**: Same as leadership (filter level configurable per user via org access)
- **director**: Only facility + department filters, no sub-filters, no admin/feedback/settings
- **manager**: Only department filter, no sub-filters, no admin/feedback/settings

---

### Phase 3: Enhanced RBAC Hook

**3.1 Update `useRBAC.ts` hook**

Extend the hook to:
- Fetch role_permissions overrides from database
- Merge defaults with overrides
- Provide `hasPermission(permission)` that checks both role defaults and overrides
- Add `getFilterPermissions()` to return allowed filter levels
- Add `getSubfilterPermissions()` to return allowed sub-filters

**3.2 Create `useRolePermissions.ts` hook**

New hook for admin panel to:
- List all roles with their permissions
- Update permission overrides in database
- Real-time sync for permission changes

---

### Phase 4: Admin UI - Roles Panel

**4.1 Create RolesManagement component** (`src/pages/admin/RolesManagement.tsx`)

Features:
- Accordion list with one section per role
- Each accordion shows:
  - Role name and description
  - Permission groups (Modules, Settings, Filters, Sub-filters)
  - Radio buttons/switches for each permission
  - Visual indicators showing defaults vs overrides

**4.2 UI Structure per Role Accordion**

```text
┌─────────────────────────────────────────────────┐
│ ▶ Leadership                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ Module Access                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ ○ Admin Module           [✗ Denied]         │ │
│ │ ○ Feedback Module        [✗ Denied]         │ │
│ │ ● Staffing               [✓ Allowed]        │ │
│ │ ● Positions              [✓ Allowed]        │ │
│ │ ● Analytics              [✓ Allowed]        │ │
│ │ ● Reports                [✓ Allowed]        │ │
│ │ ● Support                [✓ Allowed]        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Settings Access                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ ○ Volume Override Settings [✗ Denied]       │ │
│ │ ○ NP Override Settings     [✗ Denied]       │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Filter Access                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ ● Region Filter          [✓ Allowed]        │ │
│ │ ● Market Filter          [✓ Allowed]        │ │
│ │ ● Facility Filter        [✓ Allowed]        │ │
│ │ ● Department Filter      [✓ Allowed]        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Sub-filter Access                               │
│ ┌─────────────────────────────────────────────┐ │
│ │ ● Submarket Filter       [✓ Allowed]        │ │
│ │ ● Level 2 Filter         [✓ Allowed]        │ │
│ │ ● PSTAT Filter           [✓ Allowed]        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### Phase 5: Apply Permissions Throughout App

**5.1 Update DynamicIconOnlySidebar.tsx**

Modify `useDynamicSidebar.ts` to:
- Add permission requirements to each menu item
- Filter sidebar items based on `hasPermission()`

**5.2 Update FilterBar.tsx**

Modify to respect filter permissions:
- Hide/disable filters the user's role cannot access
- For Director: Only show Facility and Department
- For Manager: Only show Department
- Hide sub-filters (Submarket, Level2, PSTAT) for roles without access

**5.3 Update Settings tabs**

In `PositionPlanning.tsx` (or wherever settings tabs appear):
- Hide "Volume Settings" tab if `!hasPermission('settings.volume_override')`
- Hide "NP Settings" tab if `!hasPermission('settings.np_override')`

**5.4 Update AdminPage.tsx**

Replace placeholder "Roles" tab content with the new RolesManagement component.

---

## Technical Details

### New Files to Create:
- `src/config/rbacConfig.ts` - Permission definitions and defaults
- `src/pages/admin/RolesManagement.tsx` - Admin UI for role permissions
- `src/hooks/useRolePermissions.ts` - Hook for managing role permissions

### Files to Modify:
- `src/hooks/useRBAC.ts` - Enhanced permission checking
- `src/hooks/useUserRoles.ts` - Update role type definition
- `src/hooks/useDynamicSidebar.ts` - Add permission checks to menu items
- `src/components/staffing/FilterBar.tsx` - Respect filter permissions
- `src/pages/admin/AdminPage.tsx` - Integrate RolesManagement component
- `src/pages/staffing/PositionPlanning.tsx` - Hide settings tabs based on permissions

### Database Migration:
- Add 'manager' to app_role enum
- Update existing 'nurse_manager' records to 'manager'
- Create role_permissions table with RLS policies
- Enable realtime for role_permissions table

---

## Summary

This implementation provides:
1. Accordion-based UI in Admin for managing role permissions
2. Hybrid storage allowing defaults + database overrides
3. Filter-level restrictions (Region/Market/Facility/Department)
4. Sub-filter visibility control
5. Module access restrictions
6. Settings tab visibility control
7. Real-time permission updates across all sessions
