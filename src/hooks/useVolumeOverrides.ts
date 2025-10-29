import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VolumeOverride {
  id: string;
  market: string;
  facility_id: string;
  facility_name: string;
  department_id: string;
  department_name: string;
  override_volume: number;
  expiry_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useVolumeOverrides(facilityId: string | null) {
  return useQuery({
    queryKey: ['volume-overrides', facilityId],
    queryFn: async () => {
      if (!facilityId || facilityId === 'all-facilities') return [];
      
      const { data, error } = await supabase
        .from('volume_overrides')
        .select('*')
        .eq('facility_id', facilityId)
        .order('department_name');

      if (error) throw error;
      return data as VolumeOverride[];
    },
    enabled: !!facilityId && facilityId !== 'all-facilities',
  });
}

export function useUpsertVolumeOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (override: Partial<VolumeOverride> & { 
      market: string;
      facility_id: string;
      facility_name: string;
      department_id: string;
      department_name: string;
      override_volume: number;
      expiry_date: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      // Check if override exists
      const { data: existing } = await supabase
        .from('volume_overrides')
        .select('id')
        .eq('facility_id', override.facility_id)
        .eq('department_id', override.department_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('volume_overrides')
          .update({
            override_volume: override.override_volume,
            expiry_date: override.expiry_date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('volume_overrides')
          .insert({
            market: override.market,
            facility_id: override.facility_id,
            facility_name: override.facility_name,
            department_id: override.department_id,
            department_name: override.department_name,
            override_volume: override.override_volume,
            expiry_date: override.expiry_date,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['volume-overrides', variables.facility_id] 
      });
      toast.success('Override volume saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save override: ${error.message}`);
    },
  });
}

export function useDeleteVolumeOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, facilityId }: { id: string; facilityId: string }) => {
      const { error } = await supabase
        .from('volume_overrides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { facilityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['volume-overrides', data.facilityId] 
      });
      toast.success('Override removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove override: ${error.message}`);
    },
  });
}
