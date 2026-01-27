
# Dynamic Roles & Permissions Management

## Overview

Transform the current hybrid (code + database) RBAC system into a fully database-driven system where administrators can create, update, and delete both roles and permissions through the UI.

---

## Current State vs Target State

| Component | Current | Target |
|-----------|---------|--------|
| **Roles** | PostgreSQL ENUM (fixed) | Database table (dynamic) |
| **Permissions** | TypeScript config (fixed) | Database table (dynamic) |
| **Role-Permission mapping** | Database overrides only | Full database control |

---

## Database Changes

### 1. New `permissions` Table
Stores all available permissions that can be assigned to roles.

```text
permissions
├── id (UUID, primary key)
├── key (TEXT, unique) - e.g., "admin.access"
├── label (TEXT) - e.g., "Admin Module"
├── description (TEXT) - e.g., "Access to admin panel"
├── category (TEXT) - e.g., "modules", "settings", "filters"
├── is_system (BOOLEAN) - Prevents deletion of core permissions
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

### 2. New `roles` Table
Stores role definitions (metadata layer on top of the enum).

```text
roles
├── id (UUID, primary key)
├── name (TEXT, unique) - Must match app_role enum value
├── label (TEXT) - Display name, e.g., "Labor Management"
├── description (TEXT)
├── is_system (BOOLEAN) - Prevents deletion of core roles
├── sort_order (INTEGER) - For display ordering
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

### 3. Seed Data Migration
Insert existing roles and permissions from `rbacConfig.ts` into the new tables.

---

## Technical Considerations

### Adding New Roles (Enum Limitation)
PostgreSQL enums cannot have values removed easily. For new roles:
1. User creates role in UI → saves to `roles` table
2. A background process or admin action triggers a database migration to add the enum value
3. Until the enum is updated, the new role won't work in `user_roles`

**Recommended Approach**: 
- Replace the `app_role` enum with a TEXT column that references the `roles` table via foreign key
- This allows full dynamic CRUD without migrations
- Requires updating `user_roles.role` column type

### Updating Existing Roles
- Can update `label`, `description`, `sort_order` freely
- Cannot update `name` (key) as it's referenced elsewhere
- System roles cannot be deleted

### Adding/Updating Permissions
- Add new permission → insert into `permissions` table
- Update label/description → update the row
- System permissions (core app functionality) cannot be deleted

---

## UI Components

### Permissions Tab (Currently "Coming Soon")
Replace placeholder with a full management interface:

```text
┌────────────────────────────────────────────────────────────────┐
│ Permission Management                           [+ Add Permission]
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Filter: [All Categories ▼]  Search: [________________]         │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ MODULES                                                    │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ admin.access      │ Admin Module    │ Access to admin... │⋮ │
│ │ feedback.access   │ Feedback Module │ Access to feedba...│⋮ │
│ │ staffing.access   │ Staffing        │ Access to staffi...│⋮ │
│ │ ...                                                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SETTINGS                                                   │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ settings.volume_override │ Volume Override │ Access to...│⋮ │
│ │ settings.np_override     │ NP Override     │ Access to...│⋮ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

Features:
- View all permissions grouped by category
- Add new permission with key, label, description, category
- Edit existing permissions (label, description, category)
- Delete custom permissions (system permissions protected)

### Enhanced Roles Tab
Add CRUD controls to existing role management:

```text
┌────────────────────────────────────────────────────────────────┐
│ Role Management                                    [+ Add Role] │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────┐  ┌─────────────────────────────────────────┐   │
│ │  ROLES      │  │  SELECTED ROLE                          │   │
│ ├─────────────┤  ├─────────────────────────────────────────┤   │
│ │ ● Admin   ⋮ │  │  Label: [Admin____________]             │   │
│ │   Labor   ⋮ │  │  Description: [Full system access...]   │   │
│ │   Leader  ⋮ │  │  ─────────────────────────────────────  │   │
│ │   CNO     ⋮ │  │  PERMISSIONS                 [Reset]    │   │
│ │   Director⋮ │  │  (existing 2x2 grid of permissions)     │   │
│ │   Manager ⋮ │  │                                         │   │
│ └─────────────┘  └─────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

Features:
- View all roles with edit/delete menu (⋮)
- Create new role with name, label, description
- Edit role metadata (label, description)
- Delete custom roles (system roles protected)
- Reorder roles via drag-and-drop or sort_order

---

## New Hooks

### `usePermissions.ts`
```text
- fetchPermissions(): Get all permissions from database
- createPermission(data): Add new permission
- updatePermission(id, data): Update permission details
- deletePermission(id): Remove custom permission
- Real-time subscription for updates
```

### `useRoles.ts`
```text
- fetchRoles(): Get all roles from database
- createRole(data): Add new role
- updateRole(id, data): Update role details  
- deleteRole(id): Remove custom role
- Real-time subscription for updates
```

---

## Implementation Phases

### Phase 1: Database Schema
1. Create `permissions` table with RLS policies
2. Create `roles` table with RLS policies
3. Seed existing permissions and roles from config
4. Update `role_permissions` to reference new tables

### Phase 2: Permissions Management
1. Create `usePermissions` hook
2. Build Permissions tab UI with CRUD
3. Add permission dialog for create/edit
4. Connect to role management (dynamic permission list)

### Phase 3: Roles Management
1. Create `useRoles` hook
2. Update RolesManagement to fetch roles from DB
3. Add role CRUD dialog for create/edit
4. Add delete confirmation with dependency check

### Phase 4: Migration Path
1. Update `rbacConfig.ts` to load from database
2. Keep code defaults as fallback
3. Test all permission checks work with new system

---

## Files to Create/Modify

**New Files:**
- `src/hooks/usePermissions.ts` - Permission CRUD operations
- `src/hooks/useDynamicRoles.ts` - Role CRUD operations
- `src/components/admin/PermissionFormDialog.tsx` - Create/edit permission
- `src/components/admin/RoleFormDialog.tsx` - Create/edit role
- `src/pages/admin/PermissionsManagement.tsx` - Full permissions tab

**Modified Files:**
- `src/pages/admin/AdminPage.tsx` - Replace placeholder with PermissionsManagement
- `src/pages/admin/RolesManagement.tsx` - Add role CRUD controls
- `src/hooks/useRolePermissions.ts` - Fetch permissions from DB instead of config
- `src/config/rbacConfig.ts` - Make it load from DB with code fallback

---

## Security Considerations

1. **RLS Policies**: Only admins can modify roles/permissions tables
2. **System Flag**: Core permissions and roles marked `is_system = true` cannot be deleted
3. **Validation**: Permission keys must follow naming convention (category.action)
4. **Audit**: Track who created/modified roles and permissions
5. **Cascade Protection**: Cannot delete permission if assigned to any role
