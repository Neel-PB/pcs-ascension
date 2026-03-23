import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

interface UpdateActualFteParams {
  id: string; // positionKey
  overrideId?: string | null;
  actual_fte: number | null;
  actual_fte_expiry?: string | null;
  actual_fte_status?: string | null;
  actual_fte_shared_with?: string | null;
  actual_fte_shared_fte?: number | null;
  actual_fte_shared_expiry?: string | null;
  // Previous values for activity logging
  previousFte?: number | null;
  previousExpiry?: string | null;
  previousStatus?: string | null;
  // Optional user comment
  comment?: string;
  // User ID for new overrides
  updatedBy?: string;
}

export function useUpdateActualFte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateActualFteParams) => {
      const token = sessionStorage.getItem("nestjs_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res: Response;

      if (params.overrideId) {
        res = await fetch(`${API_BASE_URL}/position-overrides/${params.overrideId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            actualFte: params.actual_fte,
            actualFteExpiry: params.actual_fte_expiry ?? null,
            actualFteStatus: params.actual_fte_status ?? null,
            actualFteSharedWith: params.actual_fte_shared_with ?? null,
            actualFteSharedFte: params.actual_fte_shared_fte ?? null,
            actualFteSharedExpiry: params.actual_fte_shared_expiry ?? null,
            updatedBy: params.updatedBy ?? null,
          }),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/position-overrides`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            positionKey: params.id,
            actualFte: params.actual_fte,
            actualFteExpiry: params.actual_fte_expiry ?? null,
            actualFteStatus: params.actual_fte_status ?? null,
            actualFteSharedWith: params.actual_fte_shared_with ?? null,
            actualFteSharedFte: params.actual_fte_shared_fte ?? null,
            actualFteSharedExpiry: params.actual_fte_shared_expiry ?? null,
            updatedBy: params.updatedBy ?? null,
          }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      return {
        positionKey: params.id,
        overrideId: data.id,
        actual_fte: params.actual_fte,
        actual_fte_expiry: params.actual_fte_expiry,
        actual_fte_status: params.actual_fte_status,
        actual_fte_shared_with: params.actual_fte_shared_with,
        actual_fte_shared_fte: params.actual_fte_shared_fte,
        actual_fte_shared_expiry: params.actual_fte_shared_expiry,
        // Pass through for onSuccess activity comment
        updatedBy: params.updatedBy,
        comment: params.comment,
        previousFte: params.previousFte,
        previousExpiry: params.previousExpiry,
        previousStatus: params.previousStatus,
      };
    },
    onSuccess: async (updatedData) => {
      // Post structured activity comment separately
      try {
        const token = sessionStorage.getItem("nestjs_token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        await fetch(`${API_BASE_URL}/position-overrides/${updatedData.overrideId}/comments`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            text: JSON.stringify({
              fteOld: updatedData.previousFte ?? null,
              fteNew: updatedData.actual_fte,
              reasonOld: updatedData.previousStatus ?? null,
              reasonNew: updatedData.actual_fte_status ?? null,
              expiryOld: updatedData.previousExpiry ?? null,
              expiryNew: updatedData.actual_fte_expiry ?? null,
              sharedWith: updatedData.actual_fte_shared_with ?? null,
              sharedFte: updatedData.actual_fte_shared_fte ?? null,
              sharedExpiry: updatedData.actual_fte_shared_expiry ?? null,
              comment: updatedData.comment || null,
            }),
            commentType: "activity_fte",
            userId: updatedData.updatedBy ?? null,
          }),
        });
      } catch (e) {
        console.error("Failed to post FTE activity comment:", e);
      }

      const updatePositionInCache = (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((position: any) =>
          position.id === updatedData.positionKey
            ? {
                ...position,
                actual_fte: updatedData.actual_fte,
                actual_fte_expiry: updatedData.actual_fte_expiry,
                actual_fte_status: updatedData.actual_fte_status,
                actual_fte_shared_with: updatedData.actual_fte_shared_with,
                actual_fte_shared_fte: updatedData.actual_fte_shared_fte,
                actual_fte_shared_expiry: updatedData.actual_fte_shared_expiry,
                overrideId: updatedData.overrideId,
              }
            : position
        );
      };

      queryClient.setQueriesData(
        { queryKey: ['positions'] },
        updatePositionInCache
      );

      queryClient.invalidateQueries({ queryKey: ["position-comments", updatedData.positionKey] });
      queryClient.invalidateQueries({ queryKey: ["position-comment-counts"] });

      toast.success('Active FTE updated successfully');
    },
    onError: (error) => {
      console.error('Error updating actual FTE:', error);
      toast.error('Failed to update Active FTE');
    },
  });
}
