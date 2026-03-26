import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("nestjs_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface PatientVolumeRecord {
  market_hierarchy_key: string;
  hm_code: string;
  market_code: string;
  business_unit: string;
  department_id: string;
  pstat_account: string;
  concat_dept_name: string;
  region: string;
  market: string;
  nursing_flag: string;
  submarket: string;
  unit_of_service: string;
  level_2: string;
  department_description: string;
  business_unit_description: string;
  pstat: string;
  total_valid_months: number;
  oldest_month: string;
  latest_month: string;
  max_expiry_date: string;
  data_scenario: string;
  fiscal_year_man_labor_hrs: number;
  calc_volume_months: number;
  target_volume: number;
  edited_volume_override_value: number | null;
  edited_expiry_date: string | null;
  edited_updated_by: string | null;
  edited_created_at: string | null;
  edited_updated_at: string | null;
  mthly_avg_volume_12mth: number;
  dly_avg_volume_12mth: number;
  dly_avg_volume_3mth_low: number;
  dly_avg_volume_3mth_high: number;
  max_vol_patients: number | null;
  curated_data_load_ts: string;
  last_12_month_volume_stats: Array<{
    year_month: string;
    patient_volume_dly: number;
    patient_volume_mthly: number;
    patient_volume_low_high: number;
  }> | string | null;
}

interface PatientVolumeFilters {
  region?: string | null;
  market?: string | null;
  businessUnit?: string | null;
  departmentId?: string | null;
  submarket?: string | null;
  level2?: string | null;
  pstat?: string | null;
}

async function fetchPatientVolume(filters: PatientVolumeFilters): Promise<PatientVolumeRecord[]> {
  const params = new URLSearchParams();
  if (filters.region) params.append('region', filters.region);
  if (filters.market) params.append('market', filters.market);
  if (filters.businessUnit) params.append('businessUnit', filters.businessUnit);
  if (filters.departmentId) params.append('departmentId', filters.departmentId);
  if (filters.submarket) params.append('submarket', filters.submarket);
  if (filters.level2) params.append('level2', filters.level2);
  if (filters.pstat) params.append('pstat', filters.pstat);
  params.append('take', '50000');

  const url = `${API_BASE_URL}/patient-volume?${params.toString()}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch patient volume: ${res.status}`);

  const text = await res.text();
  if (!text) return [];

  const json = JSON.parse(text);
  const records: PatientVolumeRecord[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

  // Deduplicate
  const seen = new Set<string>();
  return records.filter(r => {
    const key = `${r.market_hierarchy_key}|${r.department_id}`;
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

export function usePatientVolume(filters: {
  region?: string;
  market?: string;
  facility?: string;
  department?: string;
  submarket?: string;
  level2?: string;
  pstat?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = filters;
  const cleaned = {
    region: clean(rest.region),
    market: clean(rest.market),
    businessUnit: clean(rest.facility),
    departmentId: clean(rest.department),
    submarket: clean(rest.submarket),
    level2: clean(rest.level2),
    pstat: clean(rest.pstat),
  };

  return useQuery({
    queryKey: ['patient-volume', cleaned],
    queryFn: () => fetchPatientVolume(cleaned),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}
