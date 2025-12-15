import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PositionComment {
  id: string;
  position_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  comment_type: 'comment' | 'activity_fte' | 'activity_shift';
  metadata?: {
    field?: string;
    old_value?: string | number | null;
    new_value?: string | number | null;
    expiryDate?: string | null;
    status?: string | null;
  } | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export function usePositionComments(positionId: string) {
  return useQuery({
    queryKey: ["position-comments", positionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_comments")
        .select("*")
        .eq("position_id", positionId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, avatar_url")
            .eq("id", comment.user_id)
            .single();

          return {
            ...comment,
            profiles: profile || undefined,
          };
        })
      );

      return commentsWithProfiles as PositionComment[];
    },
    enabled: !!positionId,
  });
}

export function useAddPositionComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ positionId, content }: { positionId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("position_comments")
        .insert({
          position_id: positionId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["position-comments", variables.positionId] });
      queryClient.invalidateQueries({ queryKey: ["position-comment-counts"] });
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });
}

export function useUpdatePositionComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content, positionId }: { id: string; content: string; positionId: string }) => {
      const { data, error } = await supabase
        .from("position_comments")
        .update({ content })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, positionId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["position-comments", result.positionId] });
      queryClient.invalidateQueries({ queryKey: ["position-comment-counts"] });
      toast.success("Comment updated");
    },
    onError: () => {
      toast.error("Failed to update comment");
    },
  });
}

export function useDeletePositionComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, positionId }: { id: string; positionId: string }) => {
      const { error } = await supabase
        .from("position_comments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return positionId;
    },
    onSuccess: (positionId) => {
      queryClient.invalidateQueries({ queryKey: ["position-comments", positionId] });
      queryClient.invalidateQueries({ queryKey: ["position-comment-counts"] });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });
}
