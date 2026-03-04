import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Stable empty Map to prevent referential instability during loading
const EMPTY_MAP = new Map<string, number>();

/**
 * Optimized hook for fetching comment counts per position
 * Uses the bulk POST /position-overrides/comment-counts endpoint
 */
export function usePositionCommentCounts(positionIds: string[]) {
  const positionIdsKey = useMemo(() => {
    if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
      return '';
    }
    const validIds = positionIds.filter(
      id => id != null && id !== '' && typeof id === 'string' && id.length > 0
    );
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

      const token = sessionStorage.getItem("msal_access_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const BATCH_SIZE = 500;
      const countMap = new Map<string, number>();

      for (let i = 0; i < validPositionIds.length; i += BATCH_SIZE) {
        const batch = validPositionIds.slice(i, i + BATCH_SIZE);

        try {
          const res = await fetch(`${API_BASE_URL}/position-overrides/comment-counts`, {
            method: "POST",
            headers,
            body: JSON.stringify({ positionKeys: batch }),
          });

          if (!res.ok) {
            console.error('Error fetching comment counts batch:', res.status);
            continue;
          }

          const data = await res.json();
          // Response is { "POS-123": 5, "POS-456": 0, ... }
          for (const [key, count] of Object.entries(data)) {
            if (typeof count === 'number' && count > 0) {
              countMap.set(key, count);
            }
          }
        } catch (err) {
          console.error('Error fetching comment counts batch:', err);
        }
      }

      return countMap;
    },
    enabled: validPositionIds.length > 0 && !!API_BASE_URL,
    staleTime: 30000,
  });

  return counts;
}
