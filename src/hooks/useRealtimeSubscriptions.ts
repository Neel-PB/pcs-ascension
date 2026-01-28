import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Consolidated realtime subscription hook.
 * Manages ALL Postgres realtime subscriptions in two channels:
 * 1. rbac-consolidated: Core RBAC & settings (user_roles, role_permissions, app_settings, profiles)
 * 2. data-consolidated: Notifications, comments, audit logs, permissions, roles
 * 
 * This reduces WebSocket overhead from 9+ individual channels to just 2.
 * Call this once at the App level when user is authenticated.
 */
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user?.id) return;

    // Channel 1: Core RBAC-related changes (auth-sensitive)
    const rbacChannel = supabase
      .channel('rbac-consolidated')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        (payload) => {
          // Only invalidate if change affects current user
          const newRecord = payload.new as Record<string, unknown> | null;
          const oldRecord = payload.old as Record<string, unknown> | null;
          const changedUserId = newRecord?.user_id || oldRecord?.user_id;
          if (changedUserId === user.id) {
            queryClient.invalidateQueries({ queryKey: ['user-roles', user.id] });
          }
          // Also invalidate users list for admin views
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'role_permissions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
          queryClient.invalidateQueries({ queryKey: ['user-roles'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: 'setting_key=eq.ui_settings' },
        (payload) => {
          const newSettings = payload.new?.setting_value;
          if (newSettings) {
            queryClient.setQueryData(['app-settings', 'ui_settings'], newSettings);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          // Invalidate users list for admin views
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe();

    // Channel 2: Data changes (notifications, comments, audit logs, roles, permissions)
    const dataChannel = supabase
      .channel('data-consolidated')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'position_comments' },
        () => {
          // Invalidate comment counts - components will refetch as needed
          queryClient.invalidateQueries({ queryKey: ['position-comment-counts'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rbac_audit_log' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['rbac-audit-log'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'roles' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dynamic-roles'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'permissions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rbacChannel);
      supabase.removeChannel(dataChannel);
    };
  }, [user?.id, queryClient]);
}
