import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';
import { useEffect } from 'react';

export interface UISettings {
  showFeedbackTrigger: boolean;
  enableScreenshotCapture: boolean;
  showFeedbackNavigation: boolean;
}

const DEFAULT_UI_SETTINGS: UISettings = {
  showFeedbackTrigger: true,
  enableScreenshotCapture: true,
  showFeedbackNavigation: true,
};

// NOTE: Realtime subscription for UI settings is now handled by 
// useRealtimeSubscriptions hook in a consolidated channel to reduce WebSocket overhead.
// This deprecated hook is kept for reference but should not be used.
/**
 * @deprecated Use useRealtimeSubscriptions() from src/hooks/useRealtimeSubscriptions.ts instead
 */
export function useUISettingsRealtime() {
  // No-op: Realtime is now managed by consolidated subscription hook
}

export function useUISettings() {
  return useQuery({
    queryKey: ['app-settings', 'ui_settings'],
    queryFn: async (): Promise<UISettings> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'ui_settings')
        .single();
      
      if (error) {
        console.error('Error fetching UI settings:', error);
        return DEFAULT_UI_SETTINGS;
      }
      
      // Cast through unknown to satisfy TypeScript
      const settingValue = data?.setting_value as unknown as UISettings | null;
      return settingValue ?? DEFAULT_UI_SETTINGS;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

export function useUpdateUISettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: UISettings) => {
      // Cast to Json for Supabase compatibility
      const { data, error } = await supabase
        .from('app_settings')
        .update({ setting_value: settings as unknown as Json })
        .eq('setting_key', 'ui_settings')
        .select('setting_value')
        .single();
      
      if (error) throw error;
      // Return the actual updated value from database
      const settingValue = data?.setting_value as unknown as UISettings;
      return settingValue ?? settings;
    },
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['app-settings', 'ui_settings'] });
      
      // Snapshot previous value
      const previousSettings = queryClient.getQueryData(['app-settings', 'ui_settings']);
      
      // Optimistically update to new value
      queryClient.setQueryData(['app-settings', 'ui_settings'], newSettings);
      
      return { previousSettings };
    },
    onError: (err, _newSettings, context) => {
      // Rollback on error
      queryClient.setQueryData(['app-settings', 'ui_settings'], context?.previousSettings);
      console.error('Error updating UI settings:', err);
      toast.error('Failed to save UI settings');
    },
    onSuccess: () => {
      // Invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ['app-settings', 'ui_settings'] });
      toast.success('UI settings saved successfully');
    },
  });
}
