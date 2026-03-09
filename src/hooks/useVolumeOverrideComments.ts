import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("msal_access_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface VolumeOverrideComment {
  id: string;
  text: string;
  comment_type: 'volume_change' | 'expiry_update' | 'manual_note';
  created_by: string;
  created_at: string;
}

export function useVolumeOverrideComments(overrideId: string | null) {
  return useQuery({
    queryKey: ['volume-override-comments', overrideId],
    queryFn: async () => {
      if (!overrideId) return [];

      const res = await fetch(
        `${API_BASE_URL}/volume-overrides/${overrideId}/comments`,
        { headers: getAuthHeaders() }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to fetch comments (${res.status})`);
      }

      return (await res.json()) as VolumeOverrideComment[];
    },
    enabled: !!overrideId && !overrideId.startsWith('dept-') && !!API_BASE_URL,
  });
}

export function useAddVolumeOverrideComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      overrideId,
      text,
      commentType,
    }: {
      overrideId: string;
      text: string;
      commentType: VolumeOverrideComment['comment_type'];
    }) => {
      const res = await fetch(
        `${API_BASE_URL}/volume-overrides/${overrideId}/comments`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ text, commentType }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to add comment (${res.status})`);
      }

      return { overrideId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['volume-override-comments', data.overrideId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });
}

export function useUpdateVolumeOverrideComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      overrideId,
      commentId,
      text,
    }: {
      overrideId: string;
      commentId: string;
      text: string;
    }) => {
      const res = await fetch(
        `${API_BASE_URL}/volume-overrides/${overrideId}/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ text }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to update comment (${res.status})`);
      }

      return { overrideId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['volume-override-comments', data.overrideId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update comment: ${error.message}`);
    },
  });
}

export function useDeleteVolumeOverrideComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      overrideId,
      commentId,
    }: {
      overrideId: string;
      commentId: string;
    }) => {
      const res = await fetch(
        `${API_BASE_URL}/volume-overrides/${overrideId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to delete comment (${res.status})`);
      }

      return { overrideId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['volume-override-comments', data.overrideId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    },
  });
}
