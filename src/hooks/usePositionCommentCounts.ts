import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePositionCommentCounts(positionIds: string[]) {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Early return if no position IDs
    if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
      setCounts(new Map());
      return;
    }

    // Filter out any null/undefined/empty position IDs and ensure they're strings
    const validPositionIds = positionIds.filter(
      id => id != null && id !== '' && typeof id === 'string' && id.length > 0
    );
    
    if (validPositionIds.length === 0) {
      setCounts(new Map());
      return;
    }

    // Initial fetch of comment counts
    const fetchCounts = async () => {
      try {
        // Fetch ALL comments (more efficient than passing thousands of IDs)
        const { data, error } = await supabase
          .from('position_comments')
          .select('position_id');

        if (error) {
          console.error('Error fetching comment counts:', error);
          setCounts(new Map());
          return;
        }

        // Count comments per position (filter client-side)
        const countMap = new Map<string, number>();
        if (data) {
          data.forEach((comment) => {
            // Only count if position is in our list
            if (validPositionIds.includes(comment.position_id)) {
              const currentCount = countMap.get(comment.position_id) || 0;
              countMap.set(comment.position_id, currentCount + 1);
            }
          });
        }

        // Ensure all positions have a count (even if 0)
        validPositionIds.forEach((id) => {
          if (!countMap.has(id)) {
            countMap.set(id, 0);
          }
        });

        setCounts(countMap);
      } catch (err) {
        console.error('Exception fetching comment counts:', err);
        setCounts(new Map());
      }
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
