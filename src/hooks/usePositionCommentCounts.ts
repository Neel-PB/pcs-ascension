import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export function usePositionCommentCounts(positionIds: string[]) {
  // Create a stable key from position IDs
  const positionIdsKey = useMemo(() => {
    if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
      return '';
    }
    // Filter and sort for stable key
    const validIds = positionIds.filter(
      id => id != null && id !== '' && typeof id === 'string' && id.length > 0
    );
    return validIds.sort().join(',');
  }, [positionIds]);

  const validPositionIds = useMemo(() => {
    if (!positionIds || !Array.isArray(positionIds)) return [];
    return positionIds.filter(
      id => id != null && id !== '' && typeof id === 'string' && id.length > 0
    );
  }, [positionIds]);

  const { data: counts = new Map<string, number>() } = useQuery({
    queryKey: ['position-comment-counts', positionIdsKey],
    queryFn: async () => {
      if (validPositionIds.length === 0) {
        return new Map<string, number>();
      }

      // Fetch ALL comments (more efficient than passing thousands of IDs)
      const { data, error } = await supabase
        .from('position_comments')
        .select('position_id');

      if (error) {
        console.error('Error fetching comment counts:', error);
        return new Map<string, number>();
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

      return countMap;
    },
    enabled: validPositionIds.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Realtime subscription is now handled by useRealtimeSubscriptions hook
  // which invalidates the 'position-comment-counts' query key

  return counts;
}
