import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { VolumeOverrideConfig } from '@/lib/volumeOverrideRules';

// Fetch global config
export function useGlobalVolumeOverrideConfig() {
  return useQuery({
    queryKey: ['volume-override-config', 'global'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volume_override_config')
        .select('*')
        .eq('is_global', true)
        .maybeSingle();

      if (error) throw error;
      return data as VolumeOverrideConfig | null;
    },
  });
}

// Fetch all department-specific configs
export function useDepartmentOverrideConfigs() {
  return useQuery({
    queryKey: ['volume-override-config', 'departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volume_override_config')
        .select('*')
        .eq('is_global', false)
        .order('market')
        .order('facility_name')
        .order('department_name');

      if (error) throw error;
      return data as VolumeOverrideConfig[];
    },
  });
}

// Get effective config for a specific department (exact match or fallback to global)
export function useEffectiveConfig(market?: string | null, facilityId?: string | null, departmentId?: string | null) {
  const { data: globalConfig } = useGlobalVolumeOverrideConfig();
  const { data: deptConfigs } = useDepartmentOverrideConfigs();

  // Find exact match for department
  const departmentConfig = deptConfigs?.find(
    (c) => c.market === market && c.facility_id === facilityId && c.department_id === departmentId
  );

  // Return department config if found, otherwise global
  return departmentConfig || globalConfig || null;
}

// Update global config
export function useUpdateVolumeOverrideConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<VolumeOverrideConfig>) => {
      const { data, error } = await supabase
        .from('volume_override_config')
        .update(config)
        .eq('is_global', true)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volume-override-config'] });
      queryClient.invalidateQueries({ queryKey: ['historical-volume-analysis'] });
      toast.success('Global configuration updated successfully');
    },
    onError: (error) => {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    },
  });
}

// Create or update department-specific config
export function useUpsertDepartmentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Omit<VolumeOverrideConfig, 'id' | 'is_global'> & {
      market: string;
      facility_id: string;
      facility_name: string;
      department_id: string;
      department_name: string;
    }) => {
      // Check if config exists for this department
      const { data: existing } = await supabase
        .from('volume_override_config')
        .select('id')
        .eq('is_global', false)
        .eq('market', config.market)
        .eq('facility_id', config.facility_id)
        .eq('department_id', config.department_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('volume_override_config')
          .update({
            ...config,
            is_global: false,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('volume_override_config')
          .insert({
            ...config,
            is_global: false,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volume-override-config'] });
      queryClient.invalidateQueries({ queryKey: ['historical-volume-analysis'] });
      toast.success('Department configuration saved successfully');
    },
    onError: (error) => {
      console.error('Error saving department config:', error);
      toast.error('Failed to save department configuration');
    },
  });
}

// Delete department-specific config
export function useDeleteDepartmentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('volume_override_config')
        .delete()
        .eq('id', id)
        .eq('is_global', false); // Safety check

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volume-override-config'] });
      queryClient.invalidateQueries({ queryKey: ['historical-volume-analysis'] });
      toast.success('Department configuration deleted');
    },
    onError: (error) => {
      console.error('Error deleting department config:', error);
      toast.error('Failed to delete department configuration');
    },
  });
}
