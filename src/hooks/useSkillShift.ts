import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("msal_access_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface SkillShiftRecord {
  region: string;
  market: string;
  submarket: string;
  business_unit: string;
  business_unit_description: string;
  department_id: string;
  department_description: string;
  level_2: string;
  unit_of_service: string;
  nursing_flag: string;
  market_hierarchy_key: string;
  skill_mix: string;
  broader_skill_mix_category: string;
  hired_day_fte: number;
  hired_night_fte: number;
  hired_total_fte: number;
  active_day_fte: number;
  active_night_fte: number;
  active_total_fte: number;
  open_reqs_day_fte: number;
  open_reqs_night_fte: number;
  open_reqs_total_fte: number;
  target_fte_day: number;
  target_fte_night: number;
  target_fte_total: number;
}

interface SkillShiftFilters {
  region?: string | null;
  market?: string | null;
  businessUnit?: string | null;
  departmentId?: string | null;
  submarket?: string | null;
  level2?: string | null;
  pstat?: string | null;
  nursingFlag?: string | null;
}

async function fetchSkillShift(filters: SkillShiftFilters): Promise<SkillShiftRecord[]> {
  const params = new URLSearchParams();
  if (filters.region) params.append('region', filters.region);
  if (filters.market) params.append('market', filters.market);
  if (filters.businessUnit) params.append('businessUnit', filters.businessUnit);
  if (filters.departmentId) params.append('departmentId', filters.departmentId);
  if (filters.submarket) params.append('submarket', filters.submarket);
  if (filters.level2) params.append('level2', filters.level2);
  if (filters.pstat) params.append('pstat', filters.pstat);
  if (filters.nursingFlag) params.append('nursingFlag', filters.nursingFlag);
  params.append('take', '50000');

  const url = `${API_BASE_URL}/skill-shift?${params.toString()}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch skill-shift: ${res.status}`);

  const text = await res.text();
  if (!text) return [];

  const json = JSON.parse(text);
  let records: SkillShiftRecord[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

  // Deduplicate as safety net
  const seen = new Set<string>();
  return records.filter(r => {
    const key = `${r.market_hierarchy_key}|${r.skill_mix}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const SENTINEL_VALUES = ['all-regions', 'all-markets', 'all-facilities', 'all-departments', 'all-submarkets', 'all-level2', 'all-pstat'];

function clean(val: string | undefined | null): string | null {
  if (!val || SENTINEL_VALUES.includes(val)) return null;
  return val;
}

export function useSkillShift(filters: {
  region?: string;
  market?: string;
  facility?: string;
  department?: string;
  submarket?: string;
  level2?: string;
  pstat?: string;
  nursingFlag?: string;
}) {
  const cleaned = {
    region: clean(filters.region),
    market: clean(filters.market),
    businessUnit: clean(filters.facility),
    departmentId: clean(filters.department),
    submarket: clean(filters.submarket),
    level2: clean(filters.level2),
    pstat: clean(filters.pstat),
    nursingFlag: clean(filters.nursingFlag),
  };

  return useQuery({
    queryKey: ['skill-shift', cleaned],
    queryFn: () => fetchSkillShift(cleaned),
    staleTime: 5 * 60 * 1000,
  });
}
