import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { VolumeOverrideConfig } from '@/lib/volumeOverrideRules';

export function useUpdateVolumeOverrideConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<VolumeOverrideConfig>) => {
      const { data, error } = await supabase
        .from('volume_override_config')
        .update(config)
        .eq('id', (await supabase.from('volume_override_config').select('id').single()).data?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volume-override-config'] });
      queryClient.invalidateQueries({ queryKey: ['historical-volume-analysis'] });
      toast.success('Configuration updated successfully');
    },
    onError: (error) => {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    },
  });
}
