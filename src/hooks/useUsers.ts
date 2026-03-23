import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import type { AccessScopeData } from "@/components/admin/AccessScopeManager";

export type UserRole = 'admin' | 'labor_team' | 'leadership' | 'cno' | 'director' | 'manager' | 'nurse_manager' | 'moderator' | 'user';

function flattenAccessScope(data: AccessScopeData | null | undefined): any[] {
  if (!data) return [];
  const result: any[] = [];
  data.regions.forEach(r => result.push({ region: r }));
  data.markets.forEach(m => result.push({ market: m }));
  data.facilities.forEach(f => result.push({ facility_id: f.facility_id, facility_name: f.facility_name }));
  data.departments.forEach(d => result.push({ department_id: d.department_id, department_name: d.department_name, facility_id: d.facility_id }));
  return result;
}

export interface UserWithProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: UserRole;
}

interface ApiUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  must_change_password: boolean;
  role: string;
  created_at: string;
  updated_at: string;
  roles: { id: string; role: string }[];
  accessScope: any[];
}

function mapApiUser(u: ApiUser): UserWithProfile {
  const role = u.roles?.[0]?.role || u.role || 'user';
  return {
    id: u.id,
    email: u.email || '',
    first_name: u.first_name,
    last_name: u.last_name,
    avatar_url: null,
    created_at: u.created_at,
    role: role as UserRole,
  };
}

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiFetch<ApiUser[] | { data: ApiUser[] }>('/users');
      const list = Array.isArray(response) ? response : (response.data || []);
      return list.map(mapApiUser);
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: {
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      accessScope?: AccessScopeData;
    }) => {
      return apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          accessScope: flattenAccessScope(userData.accessScope),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Invitation sent! The user will receive an email to set their password.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  const updateUser = useMutation({
    mutationFn: async (userData: {
      userId: string;
      firstName: string;
      lastName: string;
      role: string;
      accessScope?: AccessScopeData;
    }) => {
      return apiFetch(`/users/${userData.userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          accessScope: flattenAccessScope(userData.accessScope),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      return apiFetch(`/users/${userId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  return {
    users: users || [],
    isLoading,
    error,
    createUser: createUser.mutate,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,
  };
}
