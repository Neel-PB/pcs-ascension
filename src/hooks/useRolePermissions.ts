import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DEFAULT_ROLE_PERMISSIONS, 
  type AppRole, 
  type PermissionKey,
  MANAGEABLE_ROLES 
} from "@/config/rbacConfig";
import { toast } from "sonner";

interface RolePermissionOverride {
  id: string;
  role: AppRole;
  permission_key: string;
  permission_value: boolean;
  created_at: string;
  updated_at: string;
}

export function useRolePermissions() {
  const queryClient = useQueryClient();

  // Fetch all permission overrides from database
  const { data: overrides, isLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;
      return data as RolePermissionOverride[];
    },
  });

  // Realtime subscription is now handled by useRealtimeSubscriptions hook
  // No need for individual channel here

  // Get effective permissions for a role (defaults merged with overrides)
  const getEffectivePermissions = (role: AppRole): PermissionKey[] => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
    
    if (!overrides) return defaults;

    // Start with defaults as a set
    const permissionSet = new Set(defaults);

    // Apply overrides
    overrides
      .filter(o => o.role === role)
      .forEach(override => {
        if (override.permission_value) {
          permissionSet.add(override.permission_key as PermissionKey);
        } else {
          permissionSet.delete(override.permission_key as PermissionKey);
        }
      });

    return Array.from(permissionSet);
  };

  // Check if a permission is overridden for a role
  const isPermissionOverridden = (role: AppRole, permission: PermissionKey): boolean => {
    if (!overrides) return false;
    return overrides.some(o => o.role === role && o.permission_key === permission);
  };

  // Get the override value for a role/permission combo
  const getOverrideValue = (role: AppRole, permission: PermissionKey): boolean | null => {
    if (!overrides) return null;
    const override = overrides.find(o => o.role === role && o.permission_key === permission);
    return override ? override.permission_value : null;
  };

  // Set permission mutation
  const setPermission = useMutation({
    mutationFn: async ({ 
      role, 
      permission, 
      value 
    }: { 
      role: AppRole; 
      permission: PermissionKey; 
      value: boolean | null; // null = remove override, use default
    }) => {
      const defaultHasPermission = DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;

      // If value matches default, remove override
      if (value === null || value === defaultHasPermission) {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role)
          .eq('permission_key', permission);
        
        if (error) throw error;
        return { action: 'deleted' };
      }

      // Otherwise, upsert the override
      const { error } = await supabase
        .from('role_permissions')
        .upsert({
          role,
          permission_key: permission,
          permission_value: value,
        }, {
          onConflict: 'role,permission_key',
        });

      if (error) throw error;
      return { action: value ? 'granted' : 'revoked' };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      // Also invalidate user roles to refresh permissions across the app
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      
      const actionText = result.action === 'deleted' 
        ? 'reset to default' 
        : result.action === 'granted' 
          ? 'granted' 
          : 'revoked';
      toast.success(`Permission ${actionText} for ${variables.role}`);
    },
    onError: (error) => {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    },
  });

  // Bulk update permissions for a role
  const bulkUpdatePermissions = useMutation({
    mutationFn: async ({ 
      role, 
      permissions 
    }: { 
      role: AppRole; 
      permissions: { key: PermissionKey; value: boolean }[];
    }) => {
      // First, delete all overrides for this role
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role);

      if (deleteError) throw deleteError;

      // Then, insert only the overrides that differ from defaults
      const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
      const overridesToInsert = permissions
        .filter(p => {
          const defaultHas = defaults.includes(p.key);
          return p.value !== defaultHas;
        })
        .map(p => ({
          role,
          permission_key: p.key,
          permission_value: p.value,
        }));

      if (overridesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(overridesToInsert);

        if (insertError) throw insertError;
      }

      return { updated: overridesToInsert.length };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success(`Updated ${result.updated} permission overrides for ${variables.role}`);
    },
    onError: (error) => {
      console.error('Error bulk updating permissions:', error);
      toast.error('Failed to update permissions');
    },
  });

  // Reset a role to defaults (remove all overrides)
  const resetToDefaults = useMutation({
    mutationFn: async (role: AppRole) => {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role);

      if (error) throw error;
    },
    onSuccess: (_, role) => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success(`Reset ${role} to default permissions`);
    },
    onError: (error) => {
      console.error('Error resetting permissions:', error);
      toast.error('Failed to reset permissions');
    },
  });

  return {
    overrides,
    isLoading,
    manageableRoles: MANAGEABLE_ROLES,
    getEffectivePermissions,
    isPermissionOverridden,
    getOverrideValue,
    setPermission,
    bulkUpdatePermissions,
    resetToDefaults,
  };
}
