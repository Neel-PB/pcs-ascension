import { useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
  // Use centralized auth context instead of separate getUser() call
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Fetch user roles with React Query
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map(r => r.role as AppRole) || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch permission overrides with React Query
  const { data: permissionOverrides, isLoading: permissionsLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;
      return data as RolePermissionOverride[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate effective permissions for user's roles
  const effectivePermissions = useMemo(() => {
    const permissionSet = new Set<PermissionKey>();

    // For each role the user has, get its effective permissions
    roles.forEach(role => {
      // Start with defaults
      const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
      defaults.forEach(p => permissionSet.add(p));

      // Apply overrides
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
    const permissionKey = permission as PermissionKey;
    return effectivePermissions.has(permissionKey);
  }, [effectivePermissions]);

  const hasRole = useCallback((role: AppRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  // Get filter permissions
  const getFilterPermissions = useCallback((): {
    region: boolean;
    market: boolean;
    facility: boolean;
    department: boolean;
  } => {
    return {
      region: effectivePermissions.has('filters.region'),
      market: effectivePermissions.has('filters.market'),
      facility: effectivePermissions.has('filters.facility'),
      department: effectivePermissions.has('filters.department'),
    };
  }, [effectivePermissions]);

  // Get sub-filter permissions
  const getSubfilterPermissions = useCallback((): {
    submarket: boolean;
    level2: boolean;
    pstat: boolean;
  } => {
    return {
      submarket: effectivePermissions.has('filters.submarket'),
      level2: effectivePermissions.has('filters.level2'),
      pstat: effectivePermissions.has('filters.pstat'),
    };
  }, [effectivePermissions]);

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
