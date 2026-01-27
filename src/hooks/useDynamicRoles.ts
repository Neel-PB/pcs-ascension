import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface Role {
  id: string;
  name: string;
  label: string;
  description: string | null;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RoleFormData {
  name: string;
  label: string;
  description?: string;
  sort_order?: number;
}

export function useDynamicRoles() {
  const queryClient = useQueryClient();

  // Fetch all roles
  const {
    data: roles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dynamic-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Role[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("roles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "roles",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dynamic-roles"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Create role
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
      queryClient.invalidateQueries({ queryKey: ["dynamic-roles"] });
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
      queryClient.invalidateQueries({ queryKey: ["dynamic-roles"] });
      toast.success("Role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  // Delete role
  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      // First check if it's a system role
      const { data: role } = await supabase
        .from("roles")
        .select("is_system, name")
        .eq("id", id)
        .single();

      if (role?.is_system) {
        throw new Error("Cannot delete system roles");
      }

      // Check if role is assigned to any users
      // Note: We need to cast the role name to match the enum type in the database
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
      queryClient.invalidateQueries({ queryKey: ["dynamic-roles"] });
      toast.success("Role deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete role: ${error.message}`);
    },
  });

  // Get manageable roles (non-legacy)
  const manageableRoles = roles.filter(
    (role) => !["moderator", "user", "nurse_manager"].includes(role.name)
  );

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
