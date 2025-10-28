import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type ForecastPositionStatus = 'pending' | 'approved' | 'rejected';

export interface ForecastPositionToOpen {
  id: string;
  market: string;
  facility_id: string | null;
  facility_name: string;
  department_id: string | null;
  department_name: string;
  skill_type: string;
  reason_to_open: string;
  fte: number;
  status: ForecastPositionStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForecastPositionToClose {
  id: string;
  market: string;
  facility_id: string | null;
  facility_name: string;
  department_id: string | null;
  department_name: string;
  skill_type: string;
  reason_to_close: string;
  fte: number;
  status: ForecastPositionStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useForecastPositionsToOpen() {
  return useQuery({
    queryKey: ['forecast-positions-to-open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecast_positions_to_open')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ForecastPositionToOpen[];
    },
  });
}

export function useForecastPositionsToClose() {
  return useQuery({
    queryKey: ['forecast-positions-to-close'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecast_positions_to_close')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ForecastPositionToClose[];
    },
  });
}

export function useApprovePositionToOpen() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('forecast_positions_to_open')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-positions-to-open'] });
      toast({
        title: "Position approved",
        description: "The position to open has been approved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to approve",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRejectPositionToOpen() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('forecast_positions_to_open')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-positions-to-open'] });
      toast({
        title: "Position rejected",
        description: "The position to open has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to reject",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useApprovePositionToClose() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('forecast_positions_to_close')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-positions-to-close'] });
      toast({
        title: "Position approved",
        description: "The position to close has been approved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to approve",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRejectPositionToClose() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('forecast_positions_to_close')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-positions-to-close'] });
      toast({
        title: "Position rejected",
        description: "The position to close has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to reject",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
