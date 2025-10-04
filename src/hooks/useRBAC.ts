import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "./useUsers";

export function useRBAC() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      setLoading(true);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRoles();
    });

    return () => {
      subscription.unsubscribe();
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
