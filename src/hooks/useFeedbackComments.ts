import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();

  const commentsQuery = useQuery({
    queryKey: ['feedback-comments', feedbackId],
    queryFn: async () => {
      if (!feedbackId) return [];

      const { data, error } = await supabase
        .from('feedback_comments')
        .select('*')
        .eq('feedback_id', feedbackId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch author info separately
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);
      
      return data.map(c => ({
        ...c,
        author: profileMap.get(c.user_id) ?? undefined,
      })) as FeedbackComment[];
    },
    enabled: !!feedbackId,
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!feedbackId) throw new Error('No feedback selected');
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('feedback_comments')
        .insert({
          feedback_id: feedbackId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-comments', feedbackId] });
    },
    onError: (error) => {
      toast.error('Failed to add comment: ' + error.message);
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('feedback_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-comments', feedbackId] });
    },
    onError: (error) => {
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