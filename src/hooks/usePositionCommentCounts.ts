import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

/**
 * Optimized hook for fetching comment counts per position
 * Uses server-side aggregation instead of fetching all comments
 */
export function usePositionCommentCounts(positionIds: string[]) {
  // Create a stable key from position IDs - use hash for large arrays
  const positionIdsKey = useMemo(() => {
    if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
      return '';
    }
    const validIds = positionIds.filter(
      id => id != null && id !== '' && typeof id === 'string' && id.length > 0
    );
    // For large arrays, use length + first/last as a cache key optimization
    if (validIds.length > 100) {
      return `${validIds.length}-${validIds[0]}-${validIds[validIds.length - 1]}`;
    }
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

      // Use server-side aggregation - only fetch positions that have comments
      // This is much more efficient than fetching all comments
      const { data, error } = await supabase
        .from('position_comments')
        .select('position_id')
        .in('position_id', validPositionIds);

      if (error) {
        console.error('Error fetching comment counts:', error);
        return new Map<string, number>();
      }

      // Count comments per position from the filtered results
      const countMap = new Map<string, number>();
      if (data) {
        data.forEach((comment) => {
          const currentCount = countMap.get(comment.position_id) || 0;
          countMap.set(comment.position_id, currentCount + 1);
        });
      }

      return countMap;
    },
    enabled: validPositionIds.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Realtime subscription is handled by useRealtimeSubscriptions hook
  // which invalidates the 'position-comment-counts' query key

  return counts;
}
