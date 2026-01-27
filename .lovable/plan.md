

# Permission Audit Log and Missing Approvals Category Fix

## Overview

This plan addresses two issues:
1. **Missing Approvals permissions in Role Management UI** - The approvals category exists in the config but isn't displayed in the permission grid
2. **Create a permission audit log** - Track all changes to roles and permissions with who made the change and when

---

## Issue 1: Missing Approvals Permissions

### Problem
The `RolesManagement.tsx` component hardcodes only 4 permission categories in the grid layout:
- Modules
- Settings
- Filters
- Sub-filters

The **Approvals** category (with 5 permissions) exists in `rbacConfig.ts` but is not rendered in the UI.

### Solution
Update the permission grid in `RolesManagement.tsx` to include the Approvals category. Modify the 2-column grid layout to accommodate all 5 categories.

**New Layout:**
```text
┌──────────────────┬──────────────────┐
│ Modules          │ Settings         │
│ (7 permissions)  │ (2 permissions)  │
│                  ├──────────────────┤
│                  │ Filters          │
│                  │ (4 permissions)  │
├──────────────────┼──────────────────┤
│ Sub-filters      │ Approvals        │
│ (3 permissions)  │ (5 permissions)  │
└──────────────────┴──────────────────┘
```

---

## Issue 2: Permission Audit Log

### Database Schema

Create a new `rbac_audit_log` table to track all changes to roles and permissions.

**Table Structure:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| action_type | TEXT | Type of action (role_created, role_updated, role_deleted, permission_created, permission_updated, permission_deleted, permission_granted, permission_revoked) |
| target_type | TEXT | What was changed (role, permission, role_permission) |
| target_id | UUID | ID of the role or permission affected |
| target_name | TEXT | Name/key of the target for readability |
| actor_id | UUID | User who made the change |
| old_value | JSONB | Previous state (for updates) |
| new_value | JSONB | New state (for creates/updates) |
| created_at | TIMESTAMPTZ | When the change occurred |

### Database Triggers

Create triggers on the following tables to automatically log changes:
1. `roles` - Log role CRUD operations
2. `permissions` - Log permission CRUD operations
3. `role_permissions` - Log permission grants/revokes

### UI Component

Create an "Audit Log" tab in the Admin section to view the history:
- Filter by action type, target type, or actor
- Search by role/permission name
- Paginated list with timestamps and actor names
- Expandable rows to show old/new value details

---

## Implementation Steps

### Step 1: Fix Missing Approvals Category
**File:** `src/pages/admin/RolesManagement.tsx`
- Add a 5th `CompactPermissionCard` for the Approvals category
- Adjust the grid layout to fit all 5 categories cleanly

### Step 2: Create Audit Log Database Schema
**Database Migration:**
- Create `rbac_audit_log` table
- Set up RLS policies (admins can view all, authenticated users can view their own actions)
- Enable realtime for live updates

### Step 3: Create Database Triggers
**Database Migration:**
- Create trigger function `log_rbac_change()`
- Attach triggers to `roles`, `permissions`, and `role_permissions` tables
- Handle INSERT, UPDATE, DELETE events

### Step 4: Create Audit Log Hook
**New File:** `src/hooks/useRBACauditLog.ts`
- Fetch paginated audit log entries
- Filter by action type, target type, date range
- Real-time subscription for new entries

### Step 5: Create Audit Log UI
**New File:** `src/pages/admin/RBACAuditLog.tsx`
- Table view with columns: Timestamp, Action, Target, Changed By, Details
- Filter controls for action type and date range
- Expandable rows showing before/after JSON diff

### Step 6: Add Audit Log Tab to Admin
**File:** `src/pages/admin/AdminPage.tsx`
- Add new "Audit Log" tab to the admin navigation
- Import and render the `RBACAuditLog` component

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useRBACAuditLog.ts` | Hook for fetching and subscribing to audit log entries |
| `src/pages/admin/RBACAuditLog.tsx` | UI component for viewing the audit log |

### Modified Files
| File | Change |
|------|--------|
| `src/pages/admin/RolesManagement.tsx` | Add Approvals category to permission grid |
| `src/pages/admin/AdminPage.tsx` | Add Audit Log tab |

### Database Migrations
1. Create `rbac_audit_log` table with RLS policies
2. Create trigger function and attach triggers to RBAC tables

---

## Technical Details

### Trigger Function Logic

The trigger function will:
1. Capture the OLD and NEW row values
2. Determine the action type (INSERT/UPDATE/DELETE)
3. Get the current user ID from auth context
4. Insert a record into `rbac_audit_log`

```text
log_rbac_change() trigger:
  IF TG_OP = 'INSERT' THEN
    → action_type = 'created'
    → old_value = NULL
    → new_value = row_to_json(NEW)
  ELSIF TG_OP = 'UPDATE' THEN
    → action_type = 'updated'
    → old_value = row_to_json(OLD)
    → new_value = row_to_json(NEW)
  ELSIF TG_OP = 'DELETE' THEN
    → action_type = 'deleted'
    → old_value = row_to_json(OLD)
    → new_value = NULL
  END IF
```

### Audit Log Entry Types

| action_type | target_type | Triggered By |
|-------------|-------------|--------------|
| role_created | role | INSERT on roles |
| role_updated | role | UPDATE on roles |
| role_deleted | role | DELETE on roles |
| permission_created | permission | INSERT on permissions |
| permission_updated | permission | UPDATE on permissions |
| permission_deleted | permission | DELETE on permissions |
| permission_granted | role_permission | INSERT on role_permissions |
| permission_revoked | role_permission | DELETE on role_permissions |
| permission_changed | role_permission | UPDATE on role_permissions |

### Security Considerations

1. **RLS Policy:** Only admins can read the full audit log
2. **No DELETE:** Audit logs should never be deleted (no DELETE policy)
3. **System Context:** Triggers run in system context to ensure logging even if user lacks permissions
4. **Actor Tracking:** Always capture the user who made the change via `auth.uid()`

