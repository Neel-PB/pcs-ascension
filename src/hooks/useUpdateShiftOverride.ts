import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export function useUpdateShiftOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      overrideId,
      shift_override,
      originalShift,
      previousOverride,
      updatedBy,
    }: {
      id: string; // positionKey
      overrideId?: string | null;
      shift_override: string | null;
      originalShift?: string | null;
      previousOverride?: string | null;
      updatedBy?: string;
    }) => {
      const token = sessionStorage.getItem("msal_access_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const isRevert = shift_override === null;
      const shiftOld = previousOverride || originalShift;
      const shiftNew = isRevert ? originalShift : shift_override;
      const commentText = isRevert ? "Shift Reverted" : "Shift Change";

      let res: Response;

      if (overrideId) {
        res = await fetch(`${API_BASE_URL}/position-overrides/${overrideId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            shiftOverride: shift_override,
            updatedBy: updatedBy ?? null,
          }),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/position-overrides`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            positionKey: id,
            shiftOverride: shift_override,
            updatedBy: updatedBy ?? null,
          }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      return {
        positionKey: id,
        overrideId: data.id,
        shift_override,
        commentText,
        shiftOld: shiftOld ?? null,
        shiftNew: shiftNew ?? null,
        isRevert,
        updatedBy: updatedBy ?? null,
      };
    },
    onSuccess: async (updatedData) => {
      // Post structured activity comment separately
      try {
        const token = sessionStorage.getItem("msal_access_token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        await fetch(`${API_BASE_URL}/position-overrides/${updatedData.overrideId}/comments`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            text: updatedData.commentText,
            commentType: "activity_shift",
            userId: updatedData.updatedBy,
            metadata: {
              shiftOld: updatedData.shiftOld,
              shiftNew: updatedData.shiftNew,
              isRevert: updatedData.isRevert,
            },
          }),
        });
      } catch (e) {
        console.error("Failed to post shift activity comment:", e);
      }

      const updatePositionInCache = (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((position: any) =>
          position.id === updatedData.positionKey
            ? {
                ...position,
                shift_override: updatedData.shift_override,
                overrideId: updatedData.overrideId,
              }
            : position
        );
      };

      queryClient.setQueriesData(
        { queryKey: ["positions"] },
        updatePositionInCache
      );

      queryClient.invalidateQueries({ queryKey: ["position-comments", updatedData.positionKey] });
      queryClient.invalidateQueries({ queryKey: ["position-comment-counts"] });
    },
    onError: (error) => {
      console.error("Error updating shift override:", error);
      toast.error("Failed to update shift selection");
    },
  });
}
