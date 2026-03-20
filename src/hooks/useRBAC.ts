import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/apiFetch";
import { 
  DEFAULT_ROLE_PERMISSIONS, 
  type AppRole, 
  type PermissionKey 
} from "@/config/rbacConfig";

// Re-export for compatibility
export type UserRole = AppRole;

interface RolePermissionOverride {
  id: string;
  role: AppRole;
  permission_key: string;
  permission_value: boolean;
}

export function useRBAC() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Fetch user roles from NestJS
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await apiFetch<{ roles: string[] }>(`/users/${userId}/roles`);
      return (data.roles || []) as AppRole[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch permission overrides from NestJS
  const { data: permissionOverrides, isLoading: permissionsLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const data = await apiFetch<RolePermissionOverride[]>('/role-permissions');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Calculate effective permissions for user's roles
  const effectivePermissions = useMemo(() => {
    const permissionSet = new Set<PermissionKey>();

    roles.forEach(role => {
      const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
      defaults.forEach(p => permissionSet.add(p));

      if (permissionOverrides) {
        permissionOverrides
          .filter(o => o.role === role)
          .forEach(override => {
            if (override.permission_value) {
              permissionSet.add(override.permission_key as PermissionKey);
            } else {
              permissionSet.delete(override.permission_key as PermissionKey);
            }
          });
      }
    });

    return permissionSet;
  }, [roles, permissionOverrides]);

  const hasPermission = useCallback((permission: string): boolean => {
    return effectivePermissions.has(permission as PermissionKey);
  }, [effectivePermissions]);

  const hasRole = useCallback((role: AppRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  const getFilterPermissions = useCallback(() => ({
    region: effectivePermissions.has('filters.region'),
    market: effectivePermissions.has('filters.market'),
    facility: effectivePermissions.has('filters.facility'),
    department: effectivePermissions.has('filters.department'),
  }), [effectivePermissions]);

  const getSubfilterPermissions = useCallback(() => ({
    submarket: effectivePermissions.has('filters.submarket'),
    level2: effectivePermissions.has('filters.level2'),
    pstat: effectivePermissions.has('filters.pstat'),
  }), [effectivePermissions]);

  const loading = rolesLoading || permissionsLoading;

  return {
    hasPermission,
    hasRole,
    roles,
    loading,
    userId,
    effectivePermissions: Array.from(effectivePermissions),
    getFilterPermissions,
    getSubfilterPermissions,
  };
}
