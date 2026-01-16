import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateUISettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: UISettings) => {
      // Cast to Json for Supabase compatibility
      const { error } = await supabase
        .from('app_settings')
        .update({ setting_value: settings as unknown as Json })
        .eq('setting_key', 'ui_settings');
      
      if (error) throw error;
      return settings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['app-settings', 'ui_settings'], data);
      toast.success('UI settings saved successfully');
    },
    onError: (error) => {
      console.error('Error updating UI settings:', error);
      toast.error('Failed to save UI settings');
    },
  });
}
