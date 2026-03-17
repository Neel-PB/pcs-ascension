import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("msal_access_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface EmploymentSplitRecord {
  department_id: string;
  employment_type: string;
  total_fte: number;
  [key: string]: unknown;
}

interface EmploymentSplitFilters {
  region?: string | null;
  market?: string | null;
  businessUnit?: string | null;
  departmentId?: string | null;
  submarket?: string | null;
  level2?: string | null;
  pstat?: string | null;
}

async function fetchEmploymentSplit(filters: EmploymentSplitFilters): Promise<EmploymentSplitRecord[]> {
  const params = new URLSearchParams();
  if (filters.region) params.append('region', filters.region);
  if (filters.market) params.append('market', filters.market);
  if (filters.businessUnit) params.append('businessUnit', filters.businessUnit);
  if (filters.departmentId) params.append('departmentId', filters.departmentId);
  if (filters.submarket) params.append('submarket', filters.submarket);
  if (filters.level2) params.append('level2', filters.level2);
  if (filters.pstat) params.append('pstat', filters.pstat);
  params.append('take', '50000');

  const url = `${API_BASE_URL}/positions-employment-split?${params.toString()}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch positions-employment-split: ${res.status}`);

  const text = await res.text();
  if (!text) return [];

  const json = JSON.parse(text);
  return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
}

const SENTINEL_VALUES = ['all-regions', 'all-markets', 'all-facilities', 'all-departments', 'all-submarkets', 'all-level2', 'all-pstat'];

function clean(val: string | undefined | null): string | null {
  if (!val || SENTINEL_VALUES.includes(val)) return null;
  return val;
}

export interface EmploymentBreakdownPct {
  ft: number;
  pt: number;
  prn: number;
}

export function useEmploymentSplit(filters: {
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

  const query = useQuery({
    queryKey: ['employment-split', cleaned],
    queryFn: () => fetchEmploymentSplit(cleaned),
    staleTime: 5 * 60 * 1000,
  });

  const breakdown = useMemo<EmploymentBreakdownPct | null>(() => {
    if (!query.data?.length) return null;

    let ftSum = 0;
    let ptSum = 0;
    let prnSum = 0;

    for (const r of query.data) {
      const fte = Number(r.total_fte ?? 0);
      const type = (r.employment_type || '').toLowerCase();
      if (type.includes('full')) ftSum += fte;
      else if (type.includes('part')) ptSum += fte;
      else if (type.includes('prn')) prnSum += fte;
    }

    const total = ftSum + ptSum + prnSum;
    if (total === 0) return { ft: 0, pt: 0, prn: 0 };

    const [ft, pt, prn] = toPercents([ftSum, ptSum, prnSum], total);
    return { ft, pt, prn };
  }, [query.data]);

  return { ...query, breakdown };
}
