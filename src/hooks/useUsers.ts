import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export type UserRole = 'admin' | 'moderator' | 'user';

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

      // Combine the data
      const usersWithRoles: UserWithProfile[] = profiles.map(profile => {
        const roles = userRoles
          .filter(ur => ur.user_id === profile.id)
          .map(ur => ur.role as UserRole);

        return {
          id: profile.id,
          email: '', // We'll need to fetch this separately or from auth
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          created_at: profile.created_at,
          roles: roles.length > 0 ? roles : ['user'], // Default to 'user' if no roles
        };
      });

      return usersWithRoles;
    },
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe();

    const rolesChannel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(rolesChannel);
    };
  }, [queryClient]);

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      roles: UserRole[];
      bio?: string;
    }) => {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Update profile with bio if provided
      if (userData.bio) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ bio: userData.bio })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      // Assign roles
      for (const role of userData.roles) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: authData.user.id, role });

        if (roleError) throw roleError;
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
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

      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userData.userId);

      if (deleteError) throw deleteError;

      // Insert new roles
      for (const role of userData.roles) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userData.userId, role });

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
      // Note: Deleting from auth.users will cascade to profiles and user_roles
      // This needs to be done via an admin function or service role
      // For now, we'll just delete the profile and roles
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

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
