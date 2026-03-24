import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/apiFetch';

export interface FeedbackComment {
  id: string;
  feedback_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const useFeedbackComments = (feedbackId: string | null) => {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['feedback-comments', feedbackId],
    queryFn: () => apiFetch<FeedbackComment[]>(`/feedback/${feedbackId}/comments`),
    enabled: !!feedbackId,
  });

  const addComment = useMutation({
    mutationFn: (content: string) => {
      if (!feedbackId) throw new Error('No feedback selected');
      return apiFetch(`/feedback/${feedbackId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-comments', feedbackId] });
      queryClient.invalidateQueries({ queryKey: ['feedback-comment-counts'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to add comment: ' + error.message);
    },
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => {
      if (!feedbackId) throw new Error('No feedback selected');
      return apiFetch(`/feedback/${feedbackId}/comments/${commentId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-comments', feedbackId] });
      queryClient.invalidateQueries({ queryKey: ['feedback-comment-counts'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete comment: ' + error.message);
    },
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment,
    deleteComment,
  };
};
