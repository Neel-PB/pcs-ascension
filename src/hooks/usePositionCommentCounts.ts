import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePositionCommentCounts(positionIds: string[]) {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!positionIds.length) {
      setCounts(new Map());
      return;
    }

    // Initial fetch of comment counts
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from('position_comments')
        .select('position_id')
        .in('position_id', positionIds);

      if (error) {
        console.error('Error fetching comment counts:', error);
        return;
      }

      // Count comments per position
      const countMap = new Map<string, number>();
      data.forEach((comment) => {
        const currentCount = countMap.get(comment.position_id) || 0;
        countMap.set(comment.position_id, currentCount + 1);
      });

      // Ensure all positions have a count (even if 0)
      positionIds.forEach((id) => {
        if (!countMap.has(id)) {
          countMap.set(id, 0);
        }
      });

      setCounts(countMap);
    };

    fetchCounts();

    // Set up real-time subscription for comment changes
    const channel = supabase
      .channel('position-comments-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'position_comments',
        },
        (payload) => {
          // Refetch counts when comments change
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            fetchCounts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [positionIds.join(',')]);

  return counts;
}
