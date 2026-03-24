import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';

const EMPTY_MAP = new Map<string, number>();

export function useFeedbackCommentCounts() {
  const { data: counts = EMPTY_MAP } = useQuery({
    queryKey: ['feedback-comment-counts'],
    queryFn: async () => {
      const data = await apiFetch<Record<string, number>>('/feedback/comment-counts');
      return new Map<string, number>(Object.entries(data));
    },
    staleTime: 30000,
  });

  return counts;
}
