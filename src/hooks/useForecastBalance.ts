import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

// --- Types from API ---

export interface FteHeadcountEntry {
  employee_type: string;
  fte_value: number;
  hc: number;
}

export interface EmpTypeSplit {
  employment_type: string;
  hired_fte: number;
  open_reqs_fte: number;
}

export interface ForecastApiRow {
  region: string;
  market: string;
  submarket: string | null;
  business_unit: number;
  business_unit_description: string;
  department_id: number;
  department_description: string;
  level_2: string | null;
  unit_of_service: string | null;
  nursing_flag: boolean;
  skill_mix: string;
  employment_type: string;
  shift: string;
  hired_fte: number;
  open_reqs_fte: number;
  target_fte: number;
  total_fte_req: number;
  overall_status: string;
  staffing_status: string;
  action_type: string;
  addressed_fte: number;
  unaddressed_fte: number;
  fte_headcount_json: FteHeadcountEntry[] | null;
  empltype_split_hired_open: EmpTypeSplit[] | null;
  pos_nbr_to_close: (string | number)[] | null;
  load_ts: string | null;
}

// --- Sub-row (per employment type from API) ---

export interface ForecastSubRow {
  employmentType: string;
  staffingStatus: string;
  actionType: string;
  addressedFte: number;
  unaddressedFte: number;
  fteHeadcountJson: FteHeadcountEntry[];
  posNbrToClose: (string | number)[];
  hiredFte: number;
  openReqsFte: number;
  totalFteReq: number;
}

// --- Grouped row for UI ---

export interface ForecastBalanceRow {
  id: string;
  region: string;
  market: string;
  facilityId: string;
  facilityName: string;
  departmentId: string;
  departmentName: string;
  skillType: string;
  shift: string;
  hiredFte: number;
  openReqsFte: number;
  targetFte: number;
  totalFteReq: number;
  fteGap: number;
  staffingStatus: 'shortage' | 'surplus' | 'balanced';
  actionTypes: string[];
  addressedFte: number;
  unaddressedFte: number;
  fteHeadcountJson: FteHeadcountEntry[];
  nursingFlag: boolean;
  employmentType: string;
  subRows: ForecastSubRow[];
  empltypeSplitHiredOpen: EmpTypeSplit[];
}

export interface ForecastBalanceSummary {
  totalShortage: number;
  totalSurplus: number;
  shortageCount: number;
  surplusCount: number;
  rows: ForecastBalanceRow[];
}

export interface ForecastBalanceFilters {
  departmentId?: string | null;
  region?: string | null;
  market?: string | null;
  facilityId?: string | null;
  level2?: string | null;
  pstat?: string | null;
}

function normalizeEmpTypeForMerge(t: string | null | undefined): string {
  if (!t) return '';
  const upper = t.toUpperCase().trim();
  if (upper === 'FT' || upper === 'F' || upper.includes('FULL')) return 'Full-Time';
  if (upper === 'PT' || upper === 'P' || upper.includes('PART')) return 'Part-Time';
  if (upper === 'PRN' || upper === 'PD' || upper.includes('DIEM')) return 'PRN';
  return t;
}

function normalizeOverallStatus(s: string): 'shortage' | 'surplus' | 'balanced' {
  const lower = (s || '').toLowerCase();
  if (lower.includes('short')) return 'shortage';
  if (lower.includes('surp')) return 'surplus';
  return 'balanced';
}

function parseJsonField<T>(val: T | string | null): T | null {
  if (val == null) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return null; }
  }
  return val as T;
}

export function useForecastBalance(filters?: ForecastBalanceFilters) {
  const { departmentId, region, market, facilityId, level2, pstat } = filters || {};

  return useQuery({
    queryKey: ['forecast-balance', { departmentId, region, market, facilityId, level2, pstat }],
    queryFn: async (): Promise<ForecastBalanceSummary> => {
      const params = new URLSearchParams();
      params.set('take', '50000');
      if (region) params.set('region', region);
      if (market) params.set('market', market);
      if (facilityId) params.set('businessUnit', facilityId);
      if (departmentId) params.set('departmentId', departmentId);
      if (level2) params.set('level2', level2);
      if (pstat) params.set('uos', pstat);

      const response = await apiFetch<{ data: ForecastApiRow[]; total: number } | ForecastApiRow[]>(
        `/forecast?${params.toString()}`
      );

      const apiRows: ForecastApiRow[] = Array.isArray(response) ? response : response.data;

      // Group by facility + dept + skill_mix + shift
      const grouped = new Map<string, {
        region: string;
        market: string;
        businessUnit: string;
        businessUnitDesc: string;
        departmentId: string;
        departmentDesc: string;
        skillMix: string;
        shift: string;
        hiredFte: number;
        openReqsFte: number;
        targetFte: number;
        totalFteReq: number;
        addressedFte: number;
        unaddressedFte: number;
        overallStatus: string;
        actionTypes: Set<string>;
        fteHeadcountJson: FteHeadcountEntry[];
        nursingFlag: boolean;
        employmentTypes: Set<string>;
        subRows: ForecastSubRow[];
        empltypeSplitHiredOpen: EmpTypeSplit[];
      }>();

      for (const row of apiRows) {
        const key = `${row.business_unit}|${row.department_id}|${row.skill_mix}|${row.shift}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            region: row.region,
            market: row.market,
            businessUnit: String(row.business_unit),
            businessUnitDesc: row.business_unit_description,
            departmentId: String(row.department_id),
            departmentDesc: row.department_description,
            skillMix: row.skill_mix,
            shift: row.shift,
            hiredFte: 0,
            openReqsFte: 0,
            targetFte: 0,
            totalFteReq: 0,
            addressedFte: 0,
            unaddressedFte: 0,
            overallStatus: row.overall_status || row.staffing_status || '',
            actionTypes: new Set<string>(),
            fteHeadcountJson: [],
            nursingFlag: false,
            employmentTypes: new Set<string>(),
            subRows: [],
            empltypeSplitHiredOpen: [],
          });
        }

        const g = grouped.get(key)!;
        g.hiredFte += parseFloat(String(row.hired_fte)) || 0;
        g.openReqsFte += parseFloat(String(row.open_reqs_fte)) || 0;
        g.targetFte += parseFloat(String(row.target_fte)) || 0;
        g.totalFteReq += parseFloat(String(row.total_fte_req)) || 0;
        g.addressedFte += parseFloat(String(row.addressed_fte)) || 0;
        g.unaddressedFte += parseFloat(String(row.unaddressed_fte)) || 0;

        // Use first non-empty overall_status for the group
        if (row.overall_status && !g.overallStatus) {
          g.overallStatus = row.overall_status;
        }

        if (row.action_type) g.actionTypes.add(row.action_type);

        // Parse fte_headcount_json
        const parsedHc = parseJsonField<FteHeadcountEntry[]>(row.fte_headcount_json);
        if (Array.isArray(parsedHc)) {
          g.fteHeadcountJson.push(...parsedHc);
        }

        // Parse empltype_split_hired_open and merge
        const parsedSplit = parseJsonField<EmpTypeSplit[]>(row.empltype_split_hired_open);
        if (Array.isArray(parsedSplit)) {
          for (const s of parsedSplit) {
            const existing = g.empltypeSplitHiredOpen.find(e => e.employment_type === s.employment_type);
            if (existing) {
              existing.hired_fte += parseFloat(String(s.hired_fte)) || 0;
              existing.open_reqs_fte += parseFloat(String(s.open_reqs_fte)) || 0;
            } else {
              g.empltypeSplitHiredOpen.push({
                employment_type: s.employment_type,
                hired_fte: parseFloat(String(s.hired_fte)) || 0,
                open_reqs_fte: parseFloat(String(s.open_reqs_fte)) || 0,
              });
            }
          }
        }

        // Parse pos_nbr_to_close
        const parsedClose = parseJsonField<(string | number)[]>(row.pos_nbr_to_close);

        // Collect sub-row
        const nf = typeof row.nursing_flag === 'boolean' ? row.nursing_flag : String(row.nursing_flag).toLowerCase() === 'y' || String(row.nursing_flag) === 'true';
        if (nf) g.nursingFlag = true;
        if (row.employment_type) g.employmentTypes.add(row.employment_type);

        g.subRows.push({
          employmentType: row.employment_type || 'NA',
          staffingStatus: (row.staffing_status || '').toLowerCase(),
          actionType: row.action_type || '',
          addressedFte: parseFloat(String(row.addressed_fte)) || 0,
          unaddressedFte: parseFloat(String(row.unaddressed_fte)) || 0,
          fteHeadcountJson: Array.isArray(parsedHc) ? parsedHc : [],
          posNbrToClose: Array.isArray(parsedClose) ? parsedClose : [],
          hiredFte: parseFloat(String(row.hired_fte)) || 0,
          openReqsFte: parseFloat(String(row.open_reqs_fte)) || 0,
          totalFteReq: parseFloat(String(row.total_fte_req)) || 0,
        });
      }

      // Build rows
      const rows: ForecastBalanceRow[] = [];
      let totalShortage = 0;
      let totalSurplus = 0;
      let shortageCount = 0;
      let surplusCount = 0;

      for (const [key, g] of grouped) {
        const status = normalizeOverallStatus(g.overallStatus);
        const fteGap = g.totalFteReq;

        const empTypes = Array.from(g.employmentTypes).filter(t => t && t !== 'NA');
        const employmentType = empTypes.length === 1 ? empTypes[0] : 'NA';

        if (status === 'shortage') {
          totalShortage += Math.abs(fteGap);
          shortageCount++;
        } else if (status === 'surplus') {
          totalSurplus += Math.abs(fteGap);
          surplusCount++;
        }

        rows.push({
          id: key,
          region: g.region,
          market: g.market,
          facilityId: g.businessUnit,
          facilityName: g.businessUnitDesc,
          departmentId: g.departmentId,
          departmentName: g.departmentDesc,
          skillType: g.skillMix,
          shift: g.shift,
          hiredFte: g.hiredFte,
          openReqsFte: g.openReqsFte,
          targetFte: g.targetFte,
          totalFteReq: g.totalFteReq,
          fteGap,
          staffingStatus: status,
          actionTypes: Array.from(g.actionTypes),
          addressedFte: g.addressedFte,
          unaddressedFte: g.unaddressedFte,
          fteHeadcountJson: g.fteHeadcountJson,
          nursingFlag: g.nursingFlag,
          employmentType,
          subRows: g.subRows,
          empltypeSplitHiredOpen: g.empltypeSplitHiredOpen,
        });
      }

      rows.sort((a, b) => Math.abs(b.fteGap) - Math.abs(a.fteGap));

      return {
        totalShortage: Math.round(totalShortage * 10) / 10,
        totalSurplus: Math.round(totalSurplus * 10) / 10,
        shortageCount,
        surplusCount,
        rows,
      };
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}
