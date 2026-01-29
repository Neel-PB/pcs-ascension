import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Position } from '@/types/position';
import { useAddActivityLog } from './useAddActivityLog';

interface UpdateActualFteParams {
  id: string;
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
}

export function useUpdateActualFte() {
  const queryClient = useQueryClient();
  const addActivityLog = useAddActivityLog();

  return useMutation({
    mutationFn: async ({ 
      id, 
      actual_fte, 
      actual_fte_expiry, 
      actual_fte_status,
      actual_fte_shared_with,
      actual_fte_shared_fte,
      actual_fte_shared_expiry,
      previousFte,
      previousExpiry,
      previousStatus,
    }: UpdateActualFteParams) => {
      const { data, error } = await supabase
        .from('positions')
        .update({
          actual_fte,
          actual_fte_expiry,
          actual_fte_status,
          actual_fte_shared_with,
          actual_fte_shared_fte,
          actual_fte_shared_expiry,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { 
        ...data, 
        previousFte,
        previousExpiry,
        previousStatus,
      };
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
                actual_fte_shared_with: updatedData.actual_fte_shared_with,
                actual_fte_shared_fte: updatedData.actual_fte_shared_fte,
                actual_fte_shared_expiry: updatedData.actual_fte_shared_expiry,
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

      // Log activity with structured field details
      addActivityLog.mutate({
        positionId: updatedData.id,
        changeType: 'fte',
        fteDetails: {
          fte_old: updatedData.previousFte ?? null,
          fte_new: updatedData.actual_fte,
          reason_old: updatedData.previousStatus ?? null,
          reason_new: updatedData.actual_fte_status ?? null,
          expiry_old: updatedData.previousExpiry ?? null,
          expiry_new: updatedData.actual_fte_expiry ?? null,
        },
      });

      toast.success('Active FTE updated successfully');
    },
    onError: (error) => {
      console.error('Error updating actual FTE:', error);
      toast.error('Failed to update Active FTE');
    },
  });
}
