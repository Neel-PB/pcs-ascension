import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface AuditLogEntry {
  id: string;
  action_type: string;
  target_type: string;
  target_id: string | null;
  target_name: string | null;
  actor_id: string | null;
  old_value: unknown | null;
  new_value: unknown | null;
  created_at: string;
  actor_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

interface UseRBACAuditLogOptions {
  actionType?: string;
  targetType?: string;
  limit?: number;
}

export function useRBACAuditLog(options: UseRBACAuditLogOptions = {}) {
  const { actionType, targetType, limit = 50 } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["rbac-audit-log", actionType, targetType, limit],
    queryFn: async () => {
      let queryBuilder = supabase
        .from("rbac_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (actionType) {
        queryBuilder = queryBuilder.eq("action_type", actionType);
      }

      if (targetType) {
        queryBuilder = queryBuilder.eq("target_type", targetType);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      // Fetch actor profiles for each unique actor_id
      const actorIds = [...new Set(data?.map(d => d.actor_id).filter(Boolean))] as string[];
      
      let profiles: Record<string, { first_name: string | null; last_name: string | null; email: string | null }> = {};
      
      if (actorIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", actorIds);
        
        if (profileData) {
          profiles = profileData.reduce((acc, profile) => {
            acc[profile.id] = {
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email,
            };
            return acc;
          }, {} as typeof profiles);
        }
      }

      // Merge profiles into audit log entries
      return (data || []).map((entry): AuditLogEntry => ({
        ...entry,
        actor_profile: entry.actor_id ? profiles[entry.actor_id] || null : null,
      }));
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("rbac-audit-log-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rbac_audit_log",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["rbac-audit-log"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// Helper to format action types for display
export function formatActionType(actionType: string): string {
  const actionMap: Record<string, string> = {
    role_created: "Role Created",
    role_updated: "Role Updated",
    role_deleted: "Role Deleted",
    permission_created: "Permission Created",
    permission_updated: "Permission Updated",
    permission_deleted: "Permission Deleted",
    permission_granted: "Permission Granted",
    permission_revoked: "Permission Revoked",
    permission_changed: "Permission Changed",
  };
  return actionMap[actionType] || actionType;
}

// Helper to format target types for display
export function formatTargetType(targetType: string): string {
  const targetMap: Record<string, string> = {
    roles: "Role",
    permissions: "Permission",
    role_permissions: "Role Permission",
  };
  return targetMap[targetType] || targetType;
}
