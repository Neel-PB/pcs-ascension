import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Position } from "@/types/position";

export function useUpdateShiftOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, shift_override }: { id: string; shift_override: string | null }) => {
      const { data, error } = await supabase
        .from("positions")
        .update({ shift_override })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { id, shift_override: data.shift_override };
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
    },
    onError: (error) => {
      console.error("Error updating shift override:", error);
      toast.error("Failed to update shift selection");
    },
  });
}
