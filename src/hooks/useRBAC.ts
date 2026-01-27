import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch permission overrides
  const { data: permissionOverrides } = useQuery({
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

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (error) throw error;

          const rolesList = userRoles?.map(r => r.role as AppRole) || [];
          setRoles(rolesList);
        } else {
          setUserId(null);
          setRoles([]);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();

    // Subscribe to auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRoles();
    });

    // Subscribe to realtime changes on user_roles for current user
    const rolesChannel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
        },
        () => {
          fetchUserRoles();
        }
      )
      .subscribe();

    // Subscribe to realtime changes on role_permissions
    const permissionsChannel = supabase
      .channel('role-permissions-changes-rbac')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'role_permissions',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        }
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(permissionsChannel);
    };
  }, [queryClient]);

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
    // Parse permission format: "resource.action" (e.g., "admin.access")
    const permissionKey = permission as PermissionKey;
    
    // Check if any of the user's roles grant this permission
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
