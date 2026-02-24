import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const EMPTY_MAP = new Map<string, number>();

export function useFeedbackCommentCounts() {
  const { data: counts = EMPTY_MAP } = useQuery({
    queryKey: ['feedback-comment-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_comments')
        .select('feedback_id');

      if (error) {
        console.error('Error fetching feedback comment counts:', error);
        return new Map<string, number>();
      }

      const countMap = new Map<string, number>();
      data?.forEach((row) => {
        countMap.set(row.feedback_id, (countMap.get(row.feedback_id) || 0) + 1);
      });
      return countMap;
    },
    staleTime: 30000,
  });

  return counts;
}
