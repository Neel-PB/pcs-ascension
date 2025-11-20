import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "./useUsers";

export function useRBAC() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (error) throw error;

          const rolesList = userRoles?.map(r => r.role as UserRole) || [];
          setRoles(rolesList);
        } else {
          setUserId(null);
          setRoles([]);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();

    // Subscribe to auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRoles();
    });

    // Subscribe to realtime changes on user_roles for current user
    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
        },
        () => {
          fetchUserRoles();
        }
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const hasPermission = (permission: string): boolean => {
    // Parse permission format: "resource.action" (e.g., "admin.access")
    const [resource, action] = permission.split('.');

    // Admin role has all permissions
    if (roles.includes('admin')) {
      return true;
    }

    // Specific permission checks
    if (resource === 'admin' && action === 'access') {
      return roles.includes('admin');
    }

    // Default to false for unknown permissions
    return false;
  };

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  return {
    hasPermission,
    hasRole,
    roles,
    loading,
    userId,
  };
}
