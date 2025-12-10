import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUpdateShiftOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, shift_override }: { id: string; shift_override: string | null }) => {
      const { error } = await supabase
        .from("positions")
        .update({ shift_override })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
    onError: (error) => {
      console.error("Error updating shift override:", error);
      toast.error("Failed to update shift selection");
    },
  });
}
