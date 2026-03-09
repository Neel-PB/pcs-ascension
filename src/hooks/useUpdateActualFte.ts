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
      const token = sessionStorage.getItem("msal_access_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res: Response;

      if (params.overrideId) {
        // UPDATE existing override
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
            comment: params.comment || `FTE Change`,
            commentType: "activity_fte",
            metadata: {
              fteOld: params.previousFte ?? null,
              fteNew: params.actual_fte,
              reasonOld: params.previousStatus ?? null,
              reasonNew: params.actual_fte_status ?? null,
              expiryOld: params.previousExpiry ?? null,
              expiryNew: params.actual_fte_expiry ?? null,
              comment: params.comment || null,
            },
          }),
        });
      } else {
        // CREATE new override
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
            initialComment: params.comment || `FTE Change`,
            metadata: {
              fteOld: params.previousFte ?? null,
              fteNew: params.actual_fte,
              reasonOld: params.previousStatus ?? null,
              reasonNew: params.actual_fte_status ?? null,
              expiryOld: params.previousExpiry ?? null,
              expiryNew: params.actual_fte_expiry ?? null,
              comment: params.comment || null,
            },
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
      };
    },
    onSuccess: (updatedData) => {
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

      toast.success('Active FTE updated successfully');
    },
    onError: (error) => {
      console.error('Error updating actual FTE:', error);
      toast.error('Failed to update Active FTE');
    },
  });
}
