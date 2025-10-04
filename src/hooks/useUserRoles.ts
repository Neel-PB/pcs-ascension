import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'labor_team';

export function useUserRoles(userId?: string) {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;

      return data.map(r => r.role as UserRole);
    },
    enabled: !!userId,
  });

  const availableRoles: UserRole[] = ['admin', 'labor_team'];

  return {
    roles: roles || [],
    availableRoles,
    isLoading,
  };
}
