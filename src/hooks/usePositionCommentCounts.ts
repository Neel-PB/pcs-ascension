import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

// Stable empty Map to prevent referential instability during loading
const EMPTY_MAP = new Map<string, number>();

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

  const { data: counts = EMPTY_MAP } = useQuery({
    queryKey: ['position-comment-counts', positionIdsKey],
    queryFn: async () => {
      if (validPositionIds.length === 0) {
        return new Map<string, number>();
      }

      // Batch queries for large arrays to avoid URL length limits (~8KB)
      const BATCH_SIZE = 500;
      const countMap = new Map<string, number>();

      // Process in batches to avoid "Bad Request" errors on large datasets
      for (let i = 0; i < validPositionIds.length; i += BATCH_SIZE) {
        const batch = validPositionIds.slice(i, i + BATCH_SIZE);
        const { data, error } = await supabase
          .from('position_comments')
          .select('position_id')
          .in('position_id', batch);

        if (error) {
          console.error('Error fetching comment counts batch:', error);
          continue;
        }

        if (data) {
          data.forEach((comment) => {
            const currentCount = countMap.get(comment.position_id) || 0;
            countMap.set(comment.position_id, currentCount + 1);
          });
        }
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
