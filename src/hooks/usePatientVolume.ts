import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("msal_access_token");
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
  const PAGE_SIZE = 1000;
  const allRecords: PatientVolumeRecord[] = [];
  let offset = 0;

  const baseParams = new URLSearchParams();
  if (filters.region) baseParams.append('region', filters.region);
  if (filters.market) baseParams.append('market', filters.market);
  if (filters.businessUnit) baseParams.append('businessUnit', filters.businessUnit);
  if (filters.departmentId) baseParams.append('departmentId', filters.departmentId);
  if (filters.submarket) baseParams.append('submarket', filters.submarket);
  if (filters.level2) baseParams.append('level2', filters.level2);
  if (filters.pstat) baseParams.append('pstat', filters.pstat);

  while (true) {
    const params = new URLSearchParams(baseParams);
    params.append('take', String(PAGE_SIZE));
    params.append('offset', String(offset));

    const qs = params.toString();
    const url = `${API_BASE_URL}/patient-volume?${qs}`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch patient volume: ${res.status}`);

    const text = await res.text();
    if (!text) break;

    const json = JSON.parse(text);

    let pageData: PatientVolumeRecord[] = [];
    let total: number | null = null;

    if (json && Array.isArray(json.data)) {
      pageData = json.data as PatientVolumeRecord[];
      total = typeof json.total === 'number' ? json.total : null;
    } else if (Array.isArray(json)) {
      pageData = json as PatientVolumeRecord[];
    }

    allRecords.push(...pageData);

    if (pageData.length < PAGE_SIZE) break;
    if (total !== null && allRecords.length >= total) break;

    offset += PAGE_SIZE;
  }

  const seen = new Set<string>();
  const deduped = allRecords.filter(r => {
    const key = `${r.market_hierarchy_key}|${r.department_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return deduped;
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
}) {
  const cleaned = {
    region: clean(filters.region),
    market: clean(filters.market),
    businessUnit: clean(filters.facility),
    departmentId: clean(filters.department),
    submarket: clean(filters.submarket),
    level2: clean(filters.level2),
    pstat: clean(filters.pstat),
  };

  return useQuery({
    queryKey: ['patient-volume', cleaned],
    queryFn: () => fetchPatientVolume(cleaned),
    staleTime: 5 * 60 * 1000,
  });
}
