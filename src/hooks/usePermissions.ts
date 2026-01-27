import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface Permission {
  id: string;
  key: string;
  label: string;
  description: string | null;
  category: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionFormData {
  key: string;
  label: string;
  description?: string;
  category: string;
}

export function usePermissions() {
  const queryClient = useQueryClient();

  // Fetch all permissions
  const {
    data: permissions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("key", { ascending: true });

      if (error) throw error;
      return data as Permission[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("permissions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "permissions",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["permissions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Create permission
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
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
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
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update permission: ${error.message}`);
    },
  });

  // Delete permission
  const deletePermission = useMutation({
    mutationFn: async (id: string) => {
      // First check if it's a system permission
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
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete permission: ${error.message}`);
    },
  });

  // Get unique categories
  const categories = [...new Set(permissions.map((p) => p.category))];

  // Group permissions by category
  const permissionsByCategory = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return {
    permissions,
    permissionsByCategory,
    categories,
    isLoading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
  };
}
