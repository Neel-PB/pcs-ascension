import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Position } from '@/types/position';

interface UpdateActualFteParams {
  id: string;
  actual_fte: number | null;
  actual_fte_expiry?: string | null;
  actual_fte_status?: string | null;
}

export function useUpdateActualFte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actual_fte, actual_fte_expiry, actual_fte_status }: UpdateActualFteParams) => {
      const { data, error } = await supabase
        .from('positions')
        .update({
          actual_fte,
          actual_fte_expiry,
          actual_fte_status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedData) => {
      const updatePositionInCache = (oldData: Position[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(position =>
          position.id === updatedData.id
            ? {
                ...position,
                actual_fte: updatedData.actual_fte,
                actual_fte_expiry: updatedData.actual_fte_expiry,
                actual_fte_status: updatedData.actual_fte_status,
              }
            : position
        );
      };

      queryClient.setQueriesData<Position[]>(
        { queryKey: ['employees'] },
        updatePositionInCache
      );
      queryClient.setQueriesData<Position[]>(
        { queryKey: ['contractors'] },
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
