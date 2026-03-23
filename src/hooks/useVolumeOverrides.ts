import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("nestjs_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface VolumeOverride {
  id: string;
  market: string;
  facility_id: string;
  facility_name: string;
  department_id: string;
  department_name: string;
  override_volume: number;
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
  volumeOverrideValue: number;
  expiryDate: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  commentsHistory: unknown[];
}

/** Map API response to frontend interface */
function mapApiToFrontend(item: ApiVolumeOverride): VolumeOverride {
  return {
    id: item.id,
    market: item.market,
    facility_id: item.businessUnit,
    facility_name: '', // resolved from facility data on frontend
    department_id: item.departmentId,
    department_name: '', // resolved from department data on frontend
    override_volume: Number(item.volumeOverrideValue),
    expiry_date: item.expiryDate || '',
    created_by: item.updatedBy,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    region: item.region,
  };
}

export function useVolumeOverrides(facilityId: string | null) {
  return useQuery({
    queryKey: ['volume-overrides', facilityId],
    queryFn: async () => {
      if (!facilityId || facilityId === 'all-facilities') return [];

      const res = await fetch(
        `${API_BASE_URL}/volume-overrides?businessUnit=${encodeURIComponent(facilityId)}`,
        { headers: getAuthHeaders() }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to fetch overrides (${res.status})`);
      }

      const json = await res.json();
      const items: ApiVolumeOverride[] = Array.isArray(json) ? json : (json.data || []);
      return items.map(mapApiToFrontend);
    },
    enabled: !!facilityId && facilityId !== 'all-facilities' && !!API_BASE_URL,
  });
}

export interface UpsertVolumeOverridePayload {
  id?: string; // present when updating existing override
  market: string;
  facility_id: string;
  facility_name: string;
  department_id: string;
  department_name: string;
  override_volume: number;
  expiry_date: string;
  region: string;
}

export function useUpsertVolumeOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (override: UpsertVolumeOverridePayload) => {
      const isUpdate = override.id && !override.id.startsWith('dept-');

      if (isUpdate) {
        // PUT /volume-overrides/:id
        const res = await fetch(`${API_BASE_URL}/volume-overrides/${override.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            volumeOverrideValue: override.override_volume,
            expiryDate: override.expiry_date,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Failed to update override (${res.status})`);
        }

        return { facilityId: override.facility_id };
      } else {
        // POST /volume-overrides
        const res = await fetch(`${API_BASE_URL}/volume-overrides`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            businessUnit: override.facility_id,
            departmentId: override.department_id,
            region: override.region,
            market: override.market,
            volumeOverrideValue: override.override_volume,
            expiryDate: override.expiry_date,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Failed to create override (${res.status})`);
        }

        return { facilityId: override.facility_id };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['volume-overrides', data.facilityId],
      });
      toast.success('Override volume saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save override: ${error.message}`);
    },
  });
}

export function useDeleteVolumeOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, facilityId }: { id: string; facilityId: string }) => {
      const res = await fetch(`${API_BASE_URL}/volume-overrides/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to delete override (${res.status})`);
      }

      return { facilityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['volume-overrides', data.facilityId],
      });
      toast.success('Override removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove override: ${error.message}`);
    },
  });
}
