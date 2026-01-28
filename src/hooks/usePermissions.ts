import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CORE_PERMISSIONS, CORE_PERMISSIONS_BY_CATEGORY } from "@/config/rbacConfig";
import type { Permission, PermissionFormData } from "@/types/rbac";

// Re-export types for backward compatibility
export type { Permission, PermissionFormData };

export function usePermissions() {
  const queryClient = useQueryClient();

  // Fetch ONLY additional (non-core) permissions from database
  const {
    data: dbPermissions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["permissions-extension"],
    queryFn: async () => {
      const coreKeys = CORE_PERMISSIONS.map(p => p.key);
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("key", { ascending: true });

      if (error) throw error;
      
      // Filter out any permissions that match core permission keys
      return (data as Permission[]).filter(p => !coreKeys.includes(p.key));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - less frequent checks for extensions
  });

  // Merge hardcoded core permissions with DB extensions
  const permissions = useMemo(() => {
    const permMap = new Map<string, Permission>();
    
    // Add core permissions first
    CORE_PERMISSIONS.forEach(p => permMap.set(p.key, p));
    
    // DB permissions extend (add new ones)
    dbPermissions.forEach(p => permMap.set(p.key, p));
    
    return Array.from(permMap.values());
  }, [dbPermissions]);

  // Recompute categories from merged data
  const permissionsByCategory = useMemo(() => {
    return permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }, [permissions]);

  // Get unique categories
  const categories = useMemo(() => 
    [...new Set(permissions.map((p) => p.category))],
    [permissions]
  );

  // Create permission (only for non-core permissions)
  const createPermission = useMutation({
    mutationFn: async (data: PermissionFormData) => {
      const { data: result, error } = await supabase
        .from("permissions")
        .insert({
          key: data.key,
          label: data.label,
          description: data.description || null,
          category: data.category,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions-extension"] });
      toast.success("Permission created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create permission: ${error.message}`);
    },
  });

  // Update permission
  const updatePermission = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PermissionFormData>;
    }) => {
      // Don't allow updating core permissions
      const isCore = CORE_PERMISSIONS.some(p => p.id === id);
      if (isCore) {
        throw new Error("Cannot update core system permissions");
      }

      const { data: result, error } = await supabase
        .from("permissions")
        .update({
          label: data.label,
          description: data.description,
          category: data.category,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions-extension"] });
      toast.success("Permission updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update permission: ${error.message}`);
    },
  });

  // Delete permission
  const deletePermission = useMutation({
    mutationFn: async (id: string) => {
      // Don't allow deleting core permissions
      const isCore = CORE_PERMISSIONS.some(p => p.id === id);
      if (isCore) {
        throw new Error("Cannot delete core system permissions");
      }

      // First check if it's a system permission in DB
      const { data: permission } = await supabase
        .from("permissions")
        .select("is_system")
        .eq("id", id)
        .single();

      if (permission?.is_system) {
        throw new Error("Cannot delete system permissions");
      }

      const { error } = await supabase
        .from("permissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions-extension"] });
      toast.success("Permission deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete permission: ${error.message}`);
    },
  });

  return {
    permissions,
    permissionsByCategory,
    categories,
    isLoading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    // Export core data for immediate access without loading
    corePermissions: CORE_PERMISSIONS,
    corePermissionsByCategory: CORE_PERMISSIONS_BY_CATEGORY,
  };
}
