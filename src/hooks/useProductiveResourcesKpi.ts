import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("msal_access_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface ProductiveResourcesKpiRecord {
  market_hierarchy_key: number;
  region: string;
  market: string;
  submarket: string;
  business_unit: string | number;
  business_unit_description: string;
  department_id: string | number;
  department_description: string;
  level_2: string;
  unit_of_service: string;
  nursing_flag: boolean;
  paid_fte: number;
  contractor_fte: number;
  overtime_fte: number;
  non_productive_percentage: number;
  target_fte: number | null;
  load_ts: string;
  employed_productive_fte: number;
  total_prn: number;
  date: string;
}

interface ProductiveResourcesKpiFilters {
  region?: string | null;
  market?: string | null;
  businessUnit?: string | null;
  departmentId?: string | null;
  submarket?: string | null;
  level2?: string | null;
  pstat?: string | null;
}

async function fetchProductiveResourcesKpi(
  filters: ProductiveResourcesKpiFilters,
): Promise<ProductiveResourcesKpiRecord[]> {
  const params = new URLSearchParams();
  if (filters.region) params.append('region', filters.region);
  if (filters.market) params.append('market', filters.market);
  if (filters.businessUnit) params.append('businessUnit', filters.businessUnit);
  if (filters.departmentId) params.append('departmentId', filters.departmentId);
  if (filters.submarket) params.append('submarket', filters.submarket);
  if (filters.level2) params.append('level2', filters.level2);
  if (filters.pstat) params.append('pstat', filters.pstat);
  params.append('take', '50000');

  const url = `${API_BASE_URL}/productive-resources-kpi?${params.toString()}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch productive-resources-kpi: ${res.status}`);

  const text = await res.text();
  if (!text) return [];

  const json = JSON.parse(text);
  let records: ProductiveResourcesKpiRecord[] = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json)
      ? json
      : [];

  // Deduplicate by composite key
  const seen = new Set<string>();
  return records.filter(r => {
    const key = `${r.market_hierarchy_key}|${r.department_id}|${r.day_of_week}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const SENTINEL_VALUES = [
  'all-regions', 'all-markets', 'all-facilities',
  'all-departments', 'all-submarkets', 'all-level2', 'all-pstat',
];

function clean(val: string | undefined | null): string | null {
  if (!val || SENTINEL_VALUES.includes(val)) return null;
  return val;
}

export function useProductiveResourcesKpi(filters: {
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
    queryKey: ['productive-resources-kpi', cleaned],
    queryFn: () => fetchProductiveResourcesKpi(cleaned),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
