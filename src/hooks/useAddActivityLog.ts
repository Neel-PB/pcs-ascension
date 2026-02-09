import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FteChangeDetails {
  fte_old: number | null;
  fte_new: number | null;
  reason_old: string | null;
  reason_new: string | null;
  expiry_old: string | null;
  expiry_new: string | null;
}

interface ShiftChangeDetails {
  shift_old: string | null;
  shift_new: string | null;
  is_revert: boolean;
}

interface ActivityLogParams {
  positionId: string;
  changeType: 'fte' | 'shift';
  fteDetails?: FteChangeDetails;
  shiftDetails?: ShiftChangeDetails;
  comment?: string;
}

export function useAddActivityLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ positionId, changeType, fteDetails, shiftDetails, comment }: ActivityLogParams) => {
      if (!user) throw new Error('User not authenticated');

      const commentType = changeType === 'fte' ? 'activity_fte' : 'activity_shift';
      
      // Store minimal content, actual display will be built from metadata
      let content: string;
      let metadata: Record<string, unknown>;

      if (changeType === 'fte' && fteDetails) {
        content = 'FTE Change';
        metadata = {
          type: 'fte',
          fte_old: fteDetails.fte_old,
          fte_new: fteDetails.fte_new,
          reason_old: fteDetails.reason_old,
          reason_new: fteDetails.reason_new,
          expiry_old: fteDetails.expiry_old,
          expiry_new: fteDetails.expiry_new,
          comment: comment || null,
        };
      } else if (changeType === 'shift' && shiftDetails) {
        content = shiftDetails.is_revert ? 'Shift Reverted' : 'Shift Change';
        metadata = {
          type: 'shift',
          shift_old: shiftDetails.shift_old,
          shift_new: shiftDetails.shift_new,
          is_revert: shiftDetails.is_revert,
        };
      } else {
        throw new Error('Invalid activity log parameters');
      }

      const { data, error } = await supabase
        .from('position_comments')
        .insert([{
          position_id: positionId,
          user_id: user.id,
          content,
          comment_type: commentType,
          metadata: metadata as unknown as import('@/integrations/supabase/types').Json,
        }])
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