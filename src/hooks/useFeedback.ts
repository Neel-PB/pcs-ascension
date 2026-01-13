import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Feedback {
  id: string;
  user_id: string;
  title: string;
  type: 'bug' | 'feature' | 'improvement' | 'question';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  screenshot_url: string | null;
  page_url: string | null;
  browser_info: Record<string, unknown> | null;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface CreateFeedbackInput {
  title: string;
  type: 'bug' | 'feature' | 'improvement' | 'question';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  screenshot_url?: string | null;
  page_url?: string | null;
  browser_info?: Record<string, unknown> | null;
}

export const useFeedback = () => {
  const queryClient = useQueryClient();

  const feedbackQuery = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch author info separately
      const userIds = [...new Set(data.map(f => f.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);
      
      return data.map(f => ({
        ...f,
        type: f.type as Feedback['type'],
        priority: f.priority as Feedback['priority'],
        status: f.status as Feedback['status'],
        author: profileMap.get(f.user_id) ?? undefined,
      })) as Feedback[];
    },
  });

  const createFeedback = useMutation({
    mutationFn: async (input: CreateFeedbackInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          title: input.title,
          type: input.type,
          priority: input.priority,
          description: input.description,
          screenshot_url: input.screenshot_url ?? null,
          page_url: input.page_url ?? null,
          browser_info: input.browser_info ? JSON.parse(JSON.stringify(input.browser_info)) : null,
          user_id: userData.user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit feedback: ' + error.message);
    },
  });

  const updateFeedbackStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Feedback['status'] }) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const deleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete feedback: ' + error.message);
    },
  });

  return {
    feedback: feedbackQuery.data ?? [],
    isLoading: feedbackQuery.isLoading,
    isFetching: feedbackQuery.isFetching,
    createFeedback,
    updateFeedbackStatus,
    deleteFeedback,
  };
};

export const uploadScreenshot = async (blob: Blob, userId: string): Promise<string> => {
  const fileName = `${userId}/${Date.now()}.png`;
  
  const { error: uploadError } = await supabase.storage
    .from('feedback-screenshots')
    .upload(fileName, blob, {
      contentType: 'image/png',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('feedback-screenshots')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};
