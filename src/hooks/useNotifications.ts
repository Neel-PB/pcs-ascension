import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // If no notifications exist, return demo data
      if (!data || data.length === 0) {
        const now = new Date();
        return [
          {
            id: "demo-1",
            user_id: user.id,
            type: "announcement",
            title: "Q4 Staffing Plan Released",
            message: "The new quarterly staffing plan has been published. Review the updated headcount targets for your region.",
            link: "/staffing/forecast",
            read: false,
            created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          },
          {
            id: "demo-2",
            user_id: user.id,
            type: "comment",
            title: "New Comment on REQ-2024-1847",
            message: "Sarah Johnson commented: 'Please expedite this requisition - we need this role filled by end of month.'",
            link: "/positions/requisitions",
            read: false,
            created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          },
          {
            id: "demo-3",
            user_id: user.id,
            type: "mention",
            title: "You were mentioned in a discussion",
            message: "Michael Chen mentioned you in the discussion about contractor conversion rates.",
            link: "/positions/contractors",
            read: true,
            created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          },
          {
            id: "demo-4",
            user_id: user.id,
            type: "like",
            title: "Position Fill Rate Target Achieved",
            message: "Congratulations! Your region has achieved 95% position fill rate this month.",
            link: "/staffing/summary",
            read: true,
            created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          },
          {
            id: "demo-5",
            user_id: user.id,
            type: "announcement",
            title: "System Maintenance Scheduled",
            message: "Position Control system will undergo maintenance on Saturday, 2:00 AM - 4:00 AM EST.",
            read: true,
            created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          },
          {
            id: "demo-6",
            user_id: user.id,
            type: "comment",
            title: "Budget Approval Required",
            message: "3 open requisitions are pending budget approval in your department.",
            link: "/positions/requisitions",
            read: true,
            created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          },
        ] as Notification[];
      }
      
      return data as Notification[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
