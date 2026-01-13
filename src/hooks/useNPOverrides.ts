import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NPOverride {
  id: string;
  market: string;
  facility_id: string;
  facility_name: string;
  department_id: string;
  department_name: string;
  np_override_volume: number;
  expiry_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useNPOverrides(facilityId: string | null) {
  return useQuery({
    queryKey: ['np-overrides', facilityId],
    queryFn: async () => {
      if (!facilityId || facilityId === 'all-facilities') return [];
      
      const { data, error } = await supabase
        .from('np_overrides')
        .select('*')
        .eq('facility_id', facilityId)
        .order('department_name');

      if (error) throw error;
      return data as NPOverride[];
    },
    enabled: !!facilityId && facilityId !== 'all-facilities',
  });
}

export function useUpsertNPOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (override: {
      market: string;
      facility_id: string;
      facility_name: string;
      department_id: string;
      department_name: string;
      np_override_volume: number;
      expiry_date: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      // Check if override exists
      const { data: existing } = await supabase
        .from('np_overrides')
        .select('id')
        .eq('facility_id', override.facility_id)
        .eq('department_id', override.department_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('np_overrides')
          .update({
            np_override_volume: override.np_override_volume,
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
          .from('np_overrides')
          .insert({
            market: override.market,
            facility_id: override.facility_id,
            facility_name: override.facility_name,
            department_id: override.department_id,
            department_name: override.department_name,
            np_override_volume: override.np_override_volume,
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
        queryKey: ['np-overrides', variables.facility_id] 
      });
      toast.success('NP override saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save NP override: ${error.message}`);
    },
  });
}

export function useDeleteNPOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, facilityId }: { id: string; facilityId: string }) => {
      const { error } = await supabase
        .from('np_overrides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { facilityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['np-overrides', data.facilityId] 
      });
      toast.success('NP override removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove NP override: ${error.message}`);
    },
  });
}
