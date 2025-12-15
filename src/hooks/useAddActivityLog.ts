import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActivityLogParams {
  positionId: string;
  changeType: 'fte' | 'shift';
  oldValue: string | number | null;
  newValue: string | number | null;
  additionalInfo?: {
    expiryDate?: string | null;
    status?: string | null;
  };
}

export function useAddActivityLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ positionId, changeType, oldValue, newValue, additionalInfo }: ActivityLogParams) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Format the activity message
      let content: string;
      const commentType = changeType === 'fte' ? 'activity_fte' : 'activity_shift';
      
      if (changeType === 'fte') {
        const oldDisplay = oldValue !== null && oldValue !== undefined ? oldValue : 'none';
        const newDisplay = newValue !== null && newValue !== undefined ? newValue : 'none';
        content = `Active FTE changed from ${oldDisplay} to ${newDisplay}`;
        
        if (additionalInfo?.expiryDate) {
          content += ` (expires: ${additionalInfo.expiryDate})`;
        }
        if (additionalInfo?.status) {
          content += ` — ${additionalInfo.status}`;
        }
      } else {
        // Shift change
        if (newValue === null) {
          content = `Shift reset to original value`;
        } else {
          const oldDisplay = oldValue || 'original';
          content = `Shift changed from ${oldDisplay} to ${newValue}`;
        }
      }

      const metadata = {
        field: changeType === 'fte' ? 'active_fte' : 'shift_override',
        old_value: oldValue,
        new_value: newValue,
        ...(additionalInfo || {}),
      };

      const { data, error } = await supabase
        .from('position_comments')
        .insert({
          position_id: positionId,
          user_id: userData.user.id,
          content,
          comment_type: commentType,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['position-comments', variables.positionId] });
      queryClient.invalidateQueries({ queryKey: ['position-comment-counts'] });
    },
  });
}
