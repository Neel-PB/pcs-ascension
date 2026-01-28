
# Hybrid RBAC: Hardcoded Core Roles + Database Extensions

## Overview

Optimize the RBAC system for faster UI loading by hardcoding the 6 core roles and their default permissions, while maintaining the ability to add new roles and permissions via the database.

## Current Architecture

The system currently:
1. Fetches roles from `roles` table on every page load
2. Fetches permissions from `permissions` table on every page load
3. Uses hardcoded `DEFAULT_ROLE_PERMISSIONS` in `rbacConfig.ts` for permission defaults
4. Uses `role_permissions` table for overrides only

## Proposed Hybrid Architecture

```text
+----------------------------------+
|        Hardcoded Layer           |
|  (rbacConfig.ts - instant load)  |
+----------------------------------+
| - 6 Core Roles with metadata     |
| - 21 Core Permissions by category|
| - Default role->permission map   |
+----------------------------------+
            |
            v
+----------------------------------+
|       Database Extension         |
|  (Only fetched when needed)      |
+----------------------------------+
| - Additional custom roles        |
| - Additional custom permissions  |
| - Permission overrides           |
+----------------------------------+
```

## Technical Implementation

### Phase 1: Expand Hardcoded Config

**File: `src/config/rbacConfig.ts`**

Add complete role definitions with IDs for the 6 manageable roles:

```typescript
// Hardcoded core roles with full metadata
export const CORE_ROLES: Role[] = [
  {
    id: "core-admin",
    name: "admin",
    label: "Admin",
    description: "Full system access including all modules, settings, and permissions management",
    is_system: true,
    sort_order: 1,
  },
  {
    id: "core-labor_team",
    name: "labor_team",
    label: "Labor Management",
    description: "Full access to all modules, filters, and settings",
    is_system: true,
    sort_order: 2,
  },
  // ... 4 more roles
];

// Hardcoded core permissions with full metadata
export const CORE_PERMISSIONS: Permission[] = [
  {
    id: "core-admin.access",
    key: "admin.access",
    label: "Admin Module",
    description: "Access to admin panel",
    category: "modules",
    is_system: true,
  },
  // ... all 21 permissions
];

// Derived helper maps for quick lookup
export const CORE_ROLES_BY_NAME: Record<string, Role>;
export const CORE_PERMISSIONS_BY_KEY: Record<string, Permission>;
export const CORE_PERMISSIONS_BY_CATEGORY: Record<string, Permission[]>;
```

### Phase 2: Update Hooks for Hybrid Loading

**File: `src/hooks/useDynamicRoles.ts`**

Merge hardcoded core roles with any additional DB roles:

```typescript
export function useDynamicRoles() {
  // Fetch ONLY additional (non-core) roles from database
  const { data: dbRoles = [], isLoading } = useQuery({
    queryKey: ["dynamic-roles-extension"],
    queryFn: async () => {
      const coreNames = CORE_ROLES.map(r => r.name);
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .not("name", "in", `(${coreNames.join(",")})`)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Role[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - less frequent checks
  });

  // Merge: hardcoded first, then DB extensions
  const roles = useMemo(() => [...CORE_ROLES, ...dbRoles], [dbRoles]);

  // ... rest of hook
}
```

**File: `src/hooks/usePermissions.ts`**

Similar pattern - merge hardcoded with DB extensions:

```typescript
export function usePermissions() {
  // Fetch ONLY additional (non-core) permissions from database
  const { data: dbPermissions = [], isLoading } = useQuery({
    queryKey: ["permissions-extension"],
    queryFn: async () => {
      const coreKeys = CORE_PERMISSIONS.map(p => p.key);
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .not("key", "in", `(${coreKeys.join(",")})`)
        .order("category");
      if (error) throw error;
      return data as Permission[];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Merge: hardcoded first, then DB extensions
  const permissions = useMemo(() => 
    [...CORE_PERMISSIONS, ...dbPermissions], 
    [dbPermissions]
  );

  // Recompute categories and groupings from merged data
  const permissionsByCategory = useMemo(() => {
    return permissions.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);
  
  // ... rest
}
```

**File: `src/hooks/useRolePermissions.ts`**

Update to use hardcoded defaults directly without DB lookup:

```typescript
// Already uses DEFAULT_ROLE_PERMISSIONS from rbacConfig
// Only fetches role_permissions overrides (small table)
// No changes needed - already optimized
```

**File: `src/hooks/useRBAC.ts`**

Already optimized - uses `DEFAULT_ROLE_PERMISSIONS` directly:

```typescript
// Line 64: const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
// This is instant - no DB call for defaults
```

### Phase 3: Update Admin UI Components

**File: `src/components/admin/RoleDetailView.tsx`**

No changes needed - receives roles as prop from parent.

**File: `src/components/admin/PermissionMatrix.tsx`**

No changes needed - receives roles as prop, gets permissions from hook.

**File: `src/pages/admin/AccessControlPage.tsx`**

Minor optimization - can show hardcoded data immediately while DB extensions load:

```typescript
// Show skeleton only for DB extension loading, not for core data
const isLoading = false; // Core data always available
const isExtensionsLoading = rolesLoading || permissionsLoading;
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/config/rbacConfig.ts` | Add `CORE_ROLES`, `CORE_PERMISSIONS`, and helper maps |
| `src/hooks/useDynamicRoles.ts` | Merge hardcoded roles with DB extensions |
| `src/hooks/usePermissions.ts` | Merge hardcoded permissions with DB extensions |
| `src/pages/admin/AccessControlPage.tsx` | Update loading state handling |
| `src/types/rbac.ts` (new) | Shared type definitions for Role/Permission |

## Benefits

1. **Instant UI**: Core RBAC data available immediately on page load
2. **No initial DB calls**: First render doesn't wait for roles/permissions fetch
3. **Extensible**: New roles/permissions can still be added via database
4. **Maintainable**: Core roles defined in one place (`rbacConfig.ts`)
5. **Reduced API calls**: Only fetch extensions, not core data

## Implementation Notes

### Type Definitions

Create shared types to ensure consistency between hardcoded and DB data:

```typescript
// src/types/rbac.ts
export interface Role {
  id: string;
  name: string;
  label: string;
  description: string | null;
  is_system: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  key: string;
  label: string;
  description: string | null;
  category: string;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}
```

### Deduplication Strategy

When merging hardcoded and DB data, deduplicate by `name` (roles) or `key` (permissions):

```typescript
const mergedRoles = useMemo(() => {
  const roleMap = new Map<string, Role>();
  // Add hardcoded first
  CORE_ROLES.forEach(r => roleMap.set(r.name, r));
  // DB roles override or add new
  dbRoles.forEach(r => roleMap.set(r.name, r));
  return Array.from(roleMap.values()).sort((a, b) => a.sort_order - b.sort_order);
}, [dbRoles]);
```

### Query Key Updates

Update query keys to clearly indicate they're for extensions only:

- `["dynamic-roles"]` becomes `["dynamic-roles-extension"]`
- `["permissions"]` becomes `["permissions-extension"]`

This prevents cache conflicts if the full data is needed elsewhere.
