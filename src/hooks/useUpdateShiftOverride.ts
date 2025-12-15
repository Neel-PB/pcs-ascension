import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Position } from "@/types/position";
import { useAddActivityLog } from "./useAddActivityLog";

export function useUpdateShiftOverride() {
  const queryClient = useQueryClient();
  const addActivityLog = useAddActivityLog();

  return useMutation({
    mutationFn: async ({ 
      id, 
      shift_override, 
      originalShift,
      previousOverride,
    }: { 
      id: string; 
      shift_override: string | null; 
      originalShift?: string | null;
      previousOverride?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("positions")
        .update({ shift_override })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { 
        id, 
        shift_override: data.shift_override, 
        originalShift,
        previousOverride,
      };
    },
    onSuccess: (updatedData) => {
      const updatePositionInCache = (oldData: Position[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(position =>
          position.id === updatedData.id
            ? { ...position, shift_override: updatedData.shift_override }
            : position
        );
      };

      queryClient.setQueriesData<Position[]>(
        { queryKey: ["employees"] },
        updatePositionInCache
      );
      queryClient.setQueriesData<Position[]>(
        { queryKey: ["contractors"] },
        updatePositionInCache
      );

      // Determine if this is a revert (setting to null) or a change
      const isRevert = updatedData.shift_override === null;
      
      // For display: show what we're changing from/to
      const shiftOld = updatedData.previousOverride || updatedData.originalShift;
      const shiftNew = isRevert ? updatedData.originalShift : updatedData.shift_override;

      // Log activity with structured shift details
      addActivityLog.mutate({
        positionId: updatedData.id,
        changeType: 'shift',
        shiftDetails: {
          shift_old: shiftOld ?? null,
          shift_new: shiftNew ?? null,
          is_revert: isRevert,
        },
      });
    },
    onError: (error) => {
      console.error("Error updating shift override:", error);
      toast.error("Failed to update shift selection");
    },
  });
}
