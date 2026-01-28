import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = 'admin' | 'labor_team' | 'leadership' | 'cno' | 'director' | 'manager' | 'nurse_manager' | 'moderator' | 'user';

export interface UserWithProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  roles: UserRole[];
}

export function useUsers() {
  const queryClient = useQueryClient();

  // Fetch all users with their profiles and roles
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine the data - fetch ALL roles for each user
      const usersWithRoles: UserWithProfile[] = profiles.map(profile => {
        const userRolesList = userRoles.filter(ur => ur.user_id === profile.id);
        const roles = userRolesList.map(ur => ur.role as UserRole);

        return {
          id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          created_at: profile.created_at,
          roles: roles.length > 0 ? roles : ['labor_team' as UserRole],
        };
      });

      return usersWithRoles;
    },
  });

  // Realtime subscriptions are now handled by useRealtimeSubscriptions hook
  // No need for individual channels here

  // Invite user mutation
  const createUser = useMutation({
    mutationFn: async (userData: {
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      bio?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          bio: userData.bio,
        },
        headers: {
          'Origin': window.location.origin,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to invite user');

      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Invitation sent! The user will receive an email to set their password.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async (userData: {
      userId: string;
      firstName: string;
      lastName: string;
      bio?: string;
      roles: UserRole[];
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          bio: userData.bio || null,
        })
        .eq('id', userData.userId);

      if (profileError) throw profileError;

      // Update roles (delete old and insert new)
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userData.userId);

      if (deleteError) throw deleteError;

      // Insert all new roles
      if (userData.roles.length > 0) {
        const roleInserts = userData.roles.map(role => ({
          user_id: userData.userId,
          role: role,
        }));
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert(roleInserts);

        if (roleError) throw roleError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (error) throw error;
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
