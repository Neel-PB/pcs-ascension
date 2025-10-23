import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUpdateActualFte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actual_fte }: { id: string; actual_fte: number | null }) => {
      const { data, error } = await supabase
        .from('positions')
        .update({ actual_fte, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      toast.success('Actual FTE updated successfully');
    },
    onError: (error) => {
      console.error('Error updating actual FTE:', error);
      toast.error('Failed to update Actual FTE');
    },
  });
}
