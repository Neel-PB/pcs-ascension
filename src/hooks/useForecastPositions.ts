import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type ForecastPositionStatus = 'pending' | 'approved' | 'rejected';

export const VALID_FTE_VALUES = [0.2, 0.3, 0.5, 0.6, 0.75, 0.8, 0.9, 1.0];
export const FTE_TOLERANCE = 0.2;

export interface ForecastPositionToOpen {
  id: string;
  parent_id: string | null;
  is_gap_record: boolean;
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

export interface ForecastPositionToOpenWithChildren extends ForecastPositionToOpen {
  children: ForecastPositionToOpen[];
  childrenFteSum: number;
}

export interface ForecastPositionToClose {
  id: string;
  parent_id: string | null;
  is_gap_record: boolean;
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

export function useForecastPositionsToOpenWithChildren() {
  return useQuery({
    queryKey: ['forecast-positions-to-open-with-children'],
    queryFn: async () => {
      // Fetch parent records
      const { data: parents, error: parentsError } = await supabase
        .from('forecast_positions_to_open')
        .select('*')
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (parentsError) throw parentsError;

      // Fetch all child records
      const { data: children, error: childrenError } = await supabase
        .from('forecast_positions_to_open')
        .select('*')
        .not('parent_id', 'is', null);

      if (childrenError) throw childrenError;

      // Group children by parent_id
      const childrenMap = (children || []).reduce((acc, child) => {
        if (!acc[child.parent_id!]) acc[child.parent_id!] = [];
        acc[child.parent_id!].push(child as ForecastPositionToOpen);
        return acc;
      }, {} as Record<string, ForecastPositionToOpen[]>);

      // Attach children to parents
      return (parents || []).map(parent => ({
        ...(parent as ForecastPositionToOpen),
        children: childrenMap[parent.id] || [],
        childrenFteSum: (childrenMap[parent.id] || []).reduce((sum, c) => sum + Number(c.fte), 0),
      })) as ForecastPositionToOpenWithChildren[];
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

export function useRevertPositionToOpen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('forecast_positions_to_open')
        .update({
          status: 'pending',
          approved_by: null,
          approved_at: null,
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
        title: "Status reverted",
        description: "The position status has been reverted to pending.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to revert",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRevertPositionToClose() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('forecast_positions_to_close')
        .update({
          status: 'pending',
          approved_by: null,
          approved_at: null,
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
        title: "Status reverted",
        description: "The position status has been reverted to pending.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to revert",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAddChildPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentId, fte }: { parentId: string; fte: number }) => {
      // Fetch parent details
      const { data: parent, error: fetchError } = await supabase
        .from('forecast_positions_to_open')
        .select('*')
        .eq('id', parentId)
        .single();

      if (fetchError) throw fetchError;

      // Create child record
      const { data, error } = await supabase
        .from('forecast_positions_to_open')
        .insert({
          parent_id: parentId,
          is_gap_record: false,
          market: parent.market,
          facility_id: parent.facility_id,
          facility_name: parent.facility_name,
          department_id: parent.department_id,
          department_name: parent.department_name,
          skill_type: parent.skill_type,
          reason_to_open: '',
          fte: fte,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-positions-to-open-with-children'] });
      toast({
        title: "Position added",
        description: "Individual position has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add position",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateChildFte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, fte }: { childId: string; fte: number }) => {
      const { data, error } = await supabase
        .from('forecast_positions_to_open')
        .update({ fte })
        .eq('id', childId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-positions-to-open-with-children'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update FTE",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteChildPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childId: string) => {
      const { error } = await supabase
        .from('forecast_positions_to_open')
        .delete()
        .eq('id', childId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-positions-to-open-with-children'] });
      toast({
        title: "Position removed",
        description: "Individual position has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove position",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
