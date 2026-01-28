import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Consolidated realtime subscription hook.
 * Manages all RBAC and app settings subscriptions in a single channel
 * to reduce WebSocket overhead.
 * 
 * Call this once at the App level when user is authenticated.
 */
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user?.id) return;

    // Single channel for all RBAC-related changes
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
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'role_permissions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
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
      .subscribe();

    return () => {
      supabase.removeChannel(rbacChannel);
    };
  }, [user?.id, queryClient]);
}
