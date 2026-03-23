import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CORE_ROLES, ALL_CORE_ROLES } from "@/config/rbacConfig";
import type { Role, RoleFormData } from "@/types/rbac";

// Re-export Role type for backward compatibility
export type { Role, RoleFormData };

export function useDynamicRoles() {
  const queryClient = useQueryClient();

  // Fetch ONLY additional (non-core) roles from database
  const {
    data: dbRoles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dynamic-roles-extension"],
    queryFn: async () => {
      const coreNames = ALL_CORE_ROLES.map(r => r.name);
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      // Filter out any roles that match core role names (they'll come from hardcoded)
      return (data as Role[]).filter(r => !coreNames.includes(r.name));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - less frequent checks for extensions
  });

  // Merge hardcoded core roles with DB extensions
  // Use Map for deduplication - DB roles can override hardcoded if needed
  const roles = useMemo(() => {
    const roleMap = new Map<string, Role>();
    
    // Add all core roles first (including legacy)
    ALL_CORE_ROLES.forEach(r => roleMap.set(r.name, r));
    
    // DB roles extend (add new ones)
    dbRoles.forEach(r => roleMap.set(r.name, r));
    
    return Array.from(roleMap.values()).sort((a, b) => a.sort_order - b.sort_order);
  }, [dbRoles]);

  // Create role (only for non-core roles)
  const createRole = useMutation({
    mutationFn: async (data: RoleFormData) => {
      // Get the max sort_order
      const maxSortOrder = roles.length > 0 
        ? Math.max(...roles.map(r => r.sort_order)) 
        : 0;

      const { data: result, error } = await supabase
        .from("roles")
        .insert({
          name: data.name.toLowerCase().replace(/\s+/g, '_'),
          label: data.label,
          description: data.description || null,
          is_system: false,
          sort_order: data.sort_order ?? maxSortOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-roles-extension"] });
      toast.success("Role created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create role: ${error.message}`);
    },
  });

  // Update role
  const updateRole = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<RoleFormData>;
    }) => {
      // Don't allow updating core roles via DB
      const isCore = ALL_CORE_ROLES.some(r => r.id === id);
      if (isCore) {
        throw new Error("Cannot update core system roles");
      }

      const { data: result, error } = await supabase
        .from("roles")
        .update({
          label: data.label,
          description: data.description,
          sort_order: data.sort_order,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-roles-extension"] });
      toast.success("Role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  // Delete role
  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      // Don't allow deleting core roles
      const isCore = ALL_CORE_ROLES.some(r => r.id === id);
      if (isCore) {
        throw new Error("Cannot delete core system roles");
      }

      // First check if it's a system role in DB
      const { data: role } = await supabase
        .from("roles")
        .select("is_system, name")
        .eq("id", id)
        .single();

      if (role?.is_system) {
        throw new Error("Cannot delete system roles");
      }

      // Check if role is assigned to any users
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", role?.name as "admin" | "moderator" | "user" | "labor_team" | "leadership" | "cno" | "director" | "nurse_manager" | "manager");

      if (count && count > 0) {
        throw new Error("Cannot delete role that is assigned to users");
      }

      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-roles-extension"] });
      toast.success("Role deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete role: ${error.message}`);
    },
  });

  // Get manageable roles (non-legacy) - includes core manageable + any custom DB roles
  const manageableRoles = useMemo(() => {
    const legacyNames = ["moderator", "user", "nurse_manager", "cno"];
    return roles.filter(role => !legacyNames.includes(role.name));
  }, [roles]);

  return {
    roles,
    manageableRoles,
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole,
  };
}
