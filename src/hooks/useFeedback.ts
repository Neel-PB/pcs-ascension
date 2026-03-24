import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/apiFetch';

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
  pb_status: 'pending' | 'in_progress' | 'resolved' | 'closed';
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
    queryFn: () => apiFetch<Feedback[]>('/feedback'),
  });

  const createFeedback = useMutation({
    mutationFn: (input: CreateFeedbackInput) =>
      apiFetch('/feedback', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback submitted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to submit feedback: ' + error.message);
    },
  });

  const updatePcsStatus = useMutation({
    mutationFn: ({ id, pcs_status }: { id: string; pcs_status: Feedback['pcs_status'] }) =>
      apiFetch(`/feedback/${id}/pcs-status`, { method: 'PATCH', body: JSON.stringify({ pcs_status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('PCS Status updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update PCS status: ' + error.message);
    },
  });

  const updatePbStatus = useMutation({
    mutationFn: ({ id, pb_status }: { id: string; pb_status: Feedback['pb_status'] }) =>
      apiFetch(`/feedback/${id}/pb-status`, { method: 'PATCH', body: JSON.stringify({ pb_status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('PB Status updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update PB status: ' + error.message);
    },
  });

  const updateFeedbackType = useMutation({
    mutationFn: ({ id, type }: { id: string; type: Feedback['type'] }) =>
      apiFetch(`/feedback/${id}/type`, { method: 'PATCH', body: JSON.stringify({ type }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Type updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update type: ' + error.message);
    },
  });

  const updateFeedbackPriority = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: Feedback['priority'] }) =>
      apiFetch(`/feedback/${id}/priority`, { method: 'PATCH', body: JSON.stringify({ priority }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Priority updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update priority: ' + error.message);
    },
  });

  const deleteFeedback = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/feedback/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback deleted');
    },
    onError: (error: Error) => {
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

export const uploadScreenshot = async (blob: Blob, _userId?: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', blob, `${Date.now()}.png`);
  const result = await apiFetch<{ url: string }>('/feedback/upload-screenshot', {
    method: 'POST',
    body: formData,
  });
  return result.url;
};
