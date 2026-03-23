import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export type UserRole = 'admin' | 'labor_team' | 'leadership' | 'director' | 'manager' | 'nurse_manager' | 'moderator' | 'user';

export function useUserRoles(userId?: string) {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await apiFetch<{ roles: string[] }>(`/users/${userId}/roles`);
      return (data.roles || []) as UserRole[];
    },
    enabled: !!userId,
  });

  const availableRoles: UserRole[] = ['admin', 'labor_team', 'leadership', 'cno', 'director', 'manager'];

  return {
    roles: roles || [],
    availableRoles,
    isLoading,
  };
}
