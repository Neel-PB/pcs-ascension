import { useQuery } from "@tanstack/react-query";
import { FILTER_SENTINELS } from "@/lib/selectConstants";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
interface UsePositionsByFlagFilters {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

const normalizeRow = (row: any) => ({
  ...row,
  id: row.positionKey ?? row.id,
  positionNum: row.positionNumber ?? row.positionNum,
  FTE: parseFloat(row.hiredFte ?? row.FTE) || 0,
  actual_fte: parseFloat(row.activeFte ?? row.actual_fte) || 0,
  positionStatusDate: row.posStatusDate ?? row.positionStatusDate,
  departmentName: row.departmentDescription ?? row.departmentName ?? row.department_name,
  employmentType: row.employmentType ?? row.employment_type,
  skillMix: row.skill_mix ?? row.skillMix,
  facilityName: row.businessUnitDescription ?? row.facilityName ?? row.facility_name,
  facility_name: row.businessUnitDescription ?? row.facility_name ?? row.facilityName,
  jobcode: row.jobcode ?? row.jobCode ?? row.job_code,
  jobFamily: row.jobFamily ?? row.job_family,
  jobTitle: row.jobTitle ?? row.job_title,
  standardHours: row.standardHours ?? row.standard_hours,
  employeeType: row.employeeType ?? row.employee_type,
  employmentFlag: row.employmentFlag ?? row.employment_flag,
  employeeId: row.employeeId ?? row.employee_id,
  employeeName: row.employeeName ?? row.employee_name,
  managerName: row.managerName ?? row.manager_name,
  managerEmployeeId: row.managerEmployeeId ?? row.manager_employee_id,
  managerPositionNum: row.managerPositionNum ?? row.manager_position_num,
  payrollStatus: row.payrollStatus ?? row.payroll_status,
  positionLifecycle: row.positionLifecycle ?? row.position_lifecycle,
  shift: row.shift,
  region: row.region,
  market: row.market,
});

/**
 * Fetch all overrides from the NestJS API (paginated) and return as a Map keyed by positionKey.
 */
async function fetchAllOverrides(headers: Record<string, string>): Promise<Map<string, any>> {
  const overrideMap = new Map<string, any>();
  const PAGE_SIZE = 500;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `${API_BASE_URL}/position-overrides?skip=${skip}&take=${PAGE_SIZE}`,
      { headers }
    );
    if (!res.ok) {
      console.error("Failed to fetch overrides:", res.status);
      break;
    }
    const body = await res.json();
    const rows = Array.isArray(body) ? body : (body.data ?? []);
    const total = body.total ?? rows.length;

    for (const ov of rows) {
      if (ov.positionKey) {
        overrideMap.set(ov.positionKey, ov);
      }
    }

    skip += PAGE_SIZE;
    hasMore = skip < total;
  }

  return overrideMap;
}

export function usePositionsByFlag(flag: string, filters: UsePositionsByFlagFilters) {
  const token = sessionStorage.getItem("nestjs_token");

  return useQuery({
    queryKey: [
      "positions",
      flag,
      filters.selectedRegion,
      filters.selectedMarket,
      filters.selectedFacility,
      filters.selectedDepartment,
    ],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // 1. Fetch base positions (paginated)
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
        if (filters.selectedFacility !== FILTER_SENTINELS.ALL_FACILITIES)
          params.append("facility", filters.selectedFacility);
        if (filters.selectedDepartment !== FILTER_SENTINELS.ALL_DEPARTMENTS)
          params.append("department", filters.selectedDepartment);

        const res = await fetch(`${API_BASE_URL}/positions?${params}`, { headers });

        if (!res.ok) throw new Error(`Positions API error: ${res.status}`);

        const batch = await res.json();
        const rows = Array.isArray(batch) ? batch : (batch.rows ?? batch.data ?? []);
        allData.push(...rows.map(normalizeRow));

        hasMore = rows.length === PAGE_SIZE;
        offset += PAGE_SIZE;
      }

      // 2. Fetch all overrides and merge
      const overrideMap = await fetchAllOverrides(headers);

      const merged = allData.map((pos) => {
        const ov = overrideMap.get(pos.id); // id is positionKey after normalizeRow
        if (!ov) return pos;

        return {
          ...pos,
          actual_fte: ov.actualFte != null ? parseFloat(ov.actualFte) : pos.actual_fte,
          actual_fte_expiry: ov.actualFteExpiry ?? pos.actual_fte_expiry,
          actual_fte_status: ov.actualFteStatus ?? pos.actual_fte_status,
          actual_fte_shared_with: ov.actualFteSharedWith ?? pos.actual_fte_shared_with,
          actual_fte_shared_fte: ov.actualFteSharedFte != null ? parseFloat(ov.actualFteSharedFte) : pos.actual_fte_shared_fte,
          actual_fte_shared_expiry: ov.actualFteSharedExpiry ?? pos.actual_fte_shared_expiry,
          shift_override: ov.shiftOverride ?? pos.shift_override,
          overrideId: ov.id,
        };
      });

      return merged;
    },
    enabled: !!API_BASE_URL,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}
