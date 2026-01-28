import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  pcs_status: 'pending' | 'approved' | 'disregard' | 'backlog';
  pb_status: 'in_progress' | 'resolved' | 'closed';
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
  const { user } = useAuth();

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
        pcs_status: f.pcs_status as Feedback['pcs_status'],
        pb_status: f.pb_status as Feedback['pb_status'],
        author: profileMap.get(f.user_id) ?? undefined,
      })) as Feedback[];
    },
  });

  const createFeedback = useMutation({
    mutationFn: async (input: CreateFeedbackInput) => {
      if (!user) throw new Error('Not authenticated');

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
          user_id: user.id,
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

  const updatePcsStatus = useMutation({
    mutationFn: async ({ id, pcs_status }: { id: string; pcs_status: Feedback['pcs_status'] }) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({ pcs_status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('PCS Status updated');
    },
    onError: (error) => {
      toast.error('Failed to update PCS status: ' + error.message);
    },
  });

  const updatePbStatus = useMutation({
    mutationFn: async ({ id, pb_status }: { id: string; pb_status: Feedback['pb_status'] }) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({ pb_status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('PB Status updated');
    },
    onError: (error) => {
      toast.error('Failed to update PB status: ' + error.message);
    },
  });

  const updateFeedbackType = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: Feedback['type'] }) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({ type })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Type updated');
    },
    onError: (error) => {
      toast.error('Failed to update type: ' + error.message);
    },
  });

  const updateFeedbackPriority = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: Feedback['priority'] }) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({ priority })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Priority updated');
    },
    onError: (error) => {
      toast.error('Failed to update priority: ' + error.message);
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
    updatePcsStatus,
    updatePbStatus,
    updateFeedbackType,
    updateFeedbackPriority,
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