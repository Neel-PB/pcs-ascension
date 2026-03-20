import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("msal_access_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

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

/**
 * Look up the override ID for a given position key.
 * Returns the override object or null.
 */
async function lookupOverrideByKey(positionKey: string, headers: Record<string, string>) {
  const res = await fetch(`${API_BASE_URL}/position-overrides/key/${encodeURIComponent(positionKey)}`, { headers });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Override lookup failed: ${res.status}`);
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

export function usePositionComments(positionId: string) {
  return useQuery({
    queryKey: ["position-comments", positionId],
    queryFn: async () => {
      const headers = getApiHeaders();

      // Step 1: Look up override by position key
      const override = await lookupOverrideByKey(positionId, headers);
      if (!override) return [] as PositionComment[];

      // Step 2: Fetch comments for this override
      const res = await fetch(`${API_BASE_URL}/position-overrides/${override.id}/comments`, { headers });
      if (!res.ok) throw new Error(`Comments fetch failed: ${res.status}`);
      const apiComments = await res.json();

      // Step 3: Batch-fetch profiles for all authors
      const authorIds = [...new Set(
        (apiComments || [])
          .map((c: any) => c.created_by || c.createdBy || c.userId || c.user_id)
          .filter(Boolean)
      )] as string[];

      const profileMap = new Map<string, { first_name: string | null; last_name: string | null; avatar_url: string | null }>();
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url")
          .in("id", authorIds);
        (profiles || []).forEach((p) => profileMap.set(p.id, p));
      }

      // Step 4: Map API fields → frontend interface
      const commentsWithProfiles = (apiComments || []).map((c: any) => {
        const authorId = c.created_by || c.createdBy || c.userId || c.user_id;
        const commentType = c.comment_type || c.commentType || 'comment';
        let metadata = c.metadata ?? null;

        // API drops metadata field — decode from text for activity comments
        if ((commentType === 'activity_fte' || commentType === 'activity_shift') && !metadata) {
          try { metadata = JSON.parse(c.text); } catch {}
        }

        return {
          id: c.id,
          position_id: positionId,
          user_id: authorId,
          content: c.text,
          created_at: c.created_at || c.createdAt,
          updated_at: c.created_at || c.createdAt,
          comment_type: commentType,
          metadata,
          profiles: profileMap.get(authorId) || undefined,
        } as PositionComment;
      });

      // Sort newest first
      commentsWithProfiles.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return commentsWithProfiles;
    },
    enabled: !!positionId,
  });
}

export function useAddPositionComment() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: async ({ positionId, content, overrideId }: { positionId: string; content: string; overrideId?: string }) => {
      const currentUserId = user?.id;
      if (!currentUserId) throw new Error("Not authenticated");
      const headers = getApiHeaders();

      let targetOverrideId = overrideId;

      // If no overrideId provided, look it up or create a new override
      if (!targetOverrideId) {
        const override = await lookupOverrideByKey(positionId, headers);
        if (override) {
          targetOverrideId = override.id;
        } else {
          // Create a minimal override just to attach a comment
          const createRes = await fetch(`${API_BASE_URL}/position-overrides`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              positionKey: positionId,
              updatedBy: currentUserId,
              initialComment: content,
            }),
          });
          if (!createRes.ok) throw new Error("Failed to create override for comment");
          const created = await createRes.json();
          return created;
        }
      }

      const res = await fetch(`${API_BASE_URL}/position-overrides/${targetOverrideId}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: content,
          commentType: "manual_note",
          userId: currentUserId,
        }),
      });

      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
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
    mutationFn: async ({ id, content, positionId, overrideId }: { id: string; content: string; positionId: string; overrideId?: string }) => {
      const headers = getApiHeaders();

      let targetOverrideId = overrideId;
      if (!targetOverrideId) {
        const override = await lookupOverrideByKey(positionId, headers);
        if (!override) throw new Error("Override not found");
        targetOverrideId = override.id;
      }

      const res = await fetch(`${API_BASE_URL}/position-overrides/${targetOverrideId}/comments/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ text: content }),
      });

      if (!res.ok) throw new Error("Failed to update comment");
      return { data: await res.json(), positionId };
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
    mutationFn: async ({ id, positionId, overrideId }: { id: string; positionId: string; overrideId?: string }) => {
      const headers = getApiHeaders();

      let targetOverrideId = overrideId;
      if (!targetOverrideId) {
        const override = await lookupOverrideByKey(positionId, headers);
        if (!override) throw new Error("Override not found");
        targetOverrideId = override.id;
      }

      const res = await fetch(`${API_BASE_URL}/position-overrides/${targetOverrideId}/comments/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) throw new Error("Failed to delete comment");
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
