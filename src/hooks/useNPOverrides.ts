import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("nestjs_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface NPOverride {
  id: string;
  market: string;
  facility_id: string;
  facility_name: string;
  department_id: string;
  department_name: string;
  np_override_volume: number;
  expiry_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  region: string;
}

interface ApiVolumeOverride {
  id: string;
  businessUnit: string;
  departmentId: string;
  region: string;
  market: string;
  npValue: number;
  npExpiryDate: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapApiToFrontend(item: ApiVolumeOverride): NPOverride {
  return {
    id: item.id,
    market: item.market,
    facility_id: item.businessUnit,
    facility_name: '',
    department_id: item.departmentId,
    department_name: '',
    np_override_volume: item.npValue != null ? Number(item.npValue) : null,
    expiry_date: item.npExpiryDate || '',
    created_by: item.updatedBy,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    region: item.region,
  };
}

export function useNPOverrides(facilityId: string | null) {
  return useQuery({
    queryKey: ['np-overrides', facilityId],
    queryFn: async () => {
      if (!facilityId || facilityId === 'all-facilities') return [];

      const res = await fetch(
        `${API_BASE_URL}/volume-overrides?businessUnit=${encodeURIComponent(facilityId)}`,
        { headers: getAuthHeaders() }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to fetch NP overrides (${res.status})`);
      }

      const json = await res.json();
      const items: ApiVolumeOverride[] = Array.isArray(json) ? json : (json.data || []);
      return items.map(mapApiToFrontend);
    },
    enabled: !!facilityId && facilityId !== 'all-facilities' && !!API_BASE_URL,
  });
}

export interface UpsertNPOverridePayload {
  id?: string;
  market: string;
  facility_id: string;
  facility_name: string;
  department_id: string;
  department_name: string;
  np_override_volume: number;
  expiry_date: string;
  region: string;
}

export function useUpsertNPOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (override: UpsertNPOverridePayload) => {
      const res = await fetch(`${API_BASE_URL}/volume-overrides/upsert`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          businessUnit: override.facility_id,
          departmentId: override.department_id,
          region: override.region,
          market: override.market,
          npValue: override.np_override_volume,
          npExpiryDate: override.expiry_date,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to save NP override (${res.status})`);
      }

      return { facilityId: override.facility_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['np-overrides', data.facilityId],
      });
      toast.success('NP override saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save NP override: ${error.message}`);
    },
  });
}

export function useDeleteNPOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, facilityId }: { id: string; facilityId: string }) => {
      const res = await fetch(`${API_BASE_URL}/volume-overrides/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to delete NP override (${res.status})`);
      }

      return { facilityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['np-overrides', data.facilityId],
      });
      toast.success('NP override removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove NP override: ${error.message}`);
    },
  });
}
