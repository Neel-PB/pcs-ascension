import { useQuery } from "@tanstack/react-query";
import { FILTER_SENTINELS } from "@/lib/selectConstants";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
interface UsePositionsByFlagFilters {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function usePositionsByFlag(flag: string, filters: UsePositionsByFlagFilters) {
  const token = sessionStorage.getItem("msal_access_token");

  return useQuery({
    queryKey: ["positions", flag, filters.selectedRegion, filters.selectedMarket, filters.selectedFacility, filters.selectedDepartment],
    queryFn: async () => {
      const allData: any[] = [];
      const PAGE_SIZE = 1000;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          flag,
          value: "true",
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });

        if (filters.selectedRegion !== FILTER_SENTINELS.ALL_REGIONS) params.append("region", filters.selectedRegion);
        if (filters.selectedMarket !== FILTER_SENTINELS.ALL_MARKETS) params.append("market", filters.selectedMarket);
        if (filters.selectedFacility !== FILTER_SENTINELS.ALL_FACILITIES) params.append("facility", filters.selectedFacility);
        if (filters.selectedDepartment !== FILTER_SENTINELS.ALL_DEPARTMENTS) params.append("department", filters.selectedDepartment);

        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/positions?${params}`, { headers });

        if (!res.ok) throw new Error(`Positions API error: ${res.status}`);

        const batch = await res.json();
        const rows = Array.isArray(batch) ? batch : batch.data ?? [];
        allData.push(...rows);

        hasMore = rows.length === PAGE_SIZE;
        offset += PAGE_SIZE;
      }

      return allData;
    },
    enabled: !!API_BASE_URL,
  });
}
