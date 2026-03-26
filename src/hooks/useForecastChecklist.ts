import { useMemo } from 'react';
import { useForecastBalance, ForecastBalanceRow, FteHeadcountEntry, ForecastBalanceFilters } from './useForecastBalance';

export interface ChecklistPositionToOpen {
  id: string;
  skillType: string;
  region: string;
  market: string;
  facilityName: string;
  departmentName: string;
  shift: string;
  employmentType: string;
  fte: number;
  count: number;
}

export interface ChecklistPositionToClose {
  id: string;
  skillType: string;
  region: string;
  market: string;
  facilityName: string;
  departmentName: string;
  shift: string;
  employmentType: string;
  fte: number;
  count: number;
  source: 'open-reqs' | 'employed';
}

export interface PositionDetail {
  id: string;
  shift: string;
  employmentType: string;
  fte: number;
  count: number;
  source?: 'open-reqs' | 'employed';
}

export interface DepartmentSkillGroup {
  departmentName: string;
  skillType: string;
  shift: string;
  groupKey: string;
  totalFTE: number;
  totalCount: number;
  details: PositionDetail[];
}

export interface FacilityLocationGroup {
  region: string;
  market: string;
  facilityName: string;
  groupKey: string;
  totalFTE: number;
  totalCount: number;
  departmentGroups: DepartmentSkillGroup[];
}

export interface OpeningSkillSubGroup {
  skillType: string;
  totalFTE: number;
  totalCount: number;
  items: ChecklistPositionToOpen[];
}

export interface OpeningFacilityGroup {
  facilityName: string;
  totalFTE: number;
  totalCount: number;
  skillGroups: OpeningSkillSubGroup[];
}

export interface ClosureSkillSubGroup {
  skillType: string;
  totalFTE: number;
  totalCount: number;
  items: ChecklistPositionToClose[];
}

export interface ClosureFacilityGroup {
  facilityName: string;
  totalFTE: number;
  totalCount: number;
  skillGroups: ClosureSkillSubGroup[];
}

function extractOpeningsFromRow(row: ForecastBalanceRow): ChecklistPositionToOpen[] {
  if (row.staffingStatus !== 'shortage') return [];
  
  // Use fte_headcount_json entries
  if (row.fteHeadcountJson.length > 0) {
    return row.fteHeadcountJson.map((entry, idx) => ({
      id: `${row.id}-open-${idx}`,
      skillType: row.skillType,
      region: row.region,
      market: row.market,
      facilityName: row.facilityName,
      departmentName: row.departmentName,
      shift: row.shift,
      employmentType: entry.employee_type,
      fte: entry.fte_value,
      count: entry.hc,
    }));
  }

  // Fallback: single entry from totalFteReq
  if (Math.abs(row.totalFteReq) > 0.01) {
    return [{
      id: `${row.id}-open-0`,
      skillType: row.skillType,
      region: row.region,
      market: row.market,
      facilityName: row.facilityName,
      departmentName: row.departmentName,
      shift: row.shift,
      employmentType: row.employmentType !== 'NA' ? row.employmentType : 'Unknown',
      fte: Math.abs(row.totalFteReq),
      count: 1,
    }];
  }

  return [];
}

function extractClosuresFromRow(row: ForecastBalanceRow): ChecklistPositionToClose[] {
  if (row.staffingStatus !== 'surplus') return [];
  
  const items: ChecklistPositionToClose[] = [];
  const hasOpenReqs = row.openReqsFte > 0;

  if (hasOpenReqs && row.addressedFte > 0) {
    items.push({
      id: `${row.id}-close-reqs-0`,
      skillType: row.skillType,
      region: row.region,
      market: row.market,
      facilityName: row.facilityName,
      departmentName: row.departmentName,
      shift: row.shift,
      employmentType: row.employmentType !== 'NA' ? row.employmentType : 'Unknown',
      fte: row.addressedFte,
      count: 1,
      source: 'open-reqs',
    });
  }

  if (row.unaddressedFte > 0) {
    items.push({
      id: `${row.id}-close-emp-0`,
      skillType: row.skillType,
      region: row.region,
      market: row.market,
      facilityName: row.facilityName,
      departmentName: row.departmentName,
      shift: row.shift,
      employmentType: row.employmentType !== 'NA' ? row.employmentType : 'Unknown',
      fte: row.unaddressedFte,
      count: 1,
      source: 'employed',
    });
  }

  return items;
}

function groupOpeningsByLocation(openings: ChecklistPositionToOpen[]): FacilityLocationGroup[] {
  const locationMap = new Map<string, FacilityLocationGroup>();

  for (const item of openings) {
    const locationKey = `${item.region}|${item.market}|${item.facilityName}`;
    
    if (!locationMap.has(locationKey)) {
      locationMap.set(locationKey, {
        region: item.region,
        market: item.market,
        facilityName: item.facilityName,
        groupKey: locationKey,
        totalFTE: 0,
        totalCount: 0,
        departmentGroups: [],
      });
    }

    const locationGroup = locationMap.get(locationKey)!;
    const deptSkillShiftKey = `${item.departmentName}|${item.skillType}|${item.shift}`;
    
    let deptGroup = locationGroup.departmentGroups.find(dg => dg.groupKey === deptSkillShiftKey);
    if (!deptGroup) {
      deptGroup = {
        departmentName: item.departmentName,
        skillType: item.skillType,
        shift: item.shift,
        groupKey: deptSkillShiftKey,
        totalFTE: 0,
        totalCount: 0,
        details: [],
      };
      locationGroup.departmentGroups.push(deptGroup);
    }

    const itemFTE = item.fte * item.count;
    
    deptGroup.details.push({
      id: item.id,
      shift: item.shift,
      employmentType: item.employmentType,
      fte: item.fte,
      count: item.count,
    });
    deptGroup.totalFTE += itemFTE;
    deptGroup.totalCount += item.count;
    
    locationGroup.totalFTE += itemFTE;
    locationGroup.totalCount += item.count;
  }

  return Array.from(locationMap.values());
}

function groupClosuresByLocation(closures: ChecklistPositionToClose[]): FacilityLocationGroup[] {
  const locationMap = new Map<string, FacilityLocationGroup>();

  for (const item of closures) {
    const locationKey = `${item.region}|${item.market}|${item.facilityName}`;
    
    if (!locationMap.has(locationKey)) {
      locationMap.set(locationKey, {
        region: item.region,
        market: item.market,
        facilityName: item.facilityName,
        groupKey: locationKey,
        totalFTE: 0,
        totalCount: 0,
        departmentGroups: [],
      });
    }

    const locationGroup = locationMap.get(locationKey)!;
    const deptSkillShiftKey = `${item.departmentName}|${item.skillType}|${item.shift}`;
    
    let deptGroup = locationGroup.departmentGroups.find(dg => dg.groupKey === deptSkillShiftKey);
    if (!deptGroup) {
      deptGroup = {
        departmentName: item.departmentName,
        skillType: item.skillType,
        shift: item.shift,
        groupKey: deptSkillShiftKey,
        totalFTE: 0,
        totalCount: 0,
        details: [],
      };
      locationGroup.departmentGroups.push(deptGroup);
    }

    const itemFTE = item.fte * item.count;
    
    deptGroup.details.push({
      id: item.id,
      shift: item.shift,
      employmentType: item.employmentType,
      fte: item.fte,
      count: item.count,
      source: item.source,
    });
    deptGroup.totalFTE += itemFTE;
    deptGroup.totalCount += item.count;
    
    locationGroup.totalFTE += itemFTE;
    locationGroup.totalCount += item.count;
  }

  return Array.from(locationMap.values());
}

export function useForecastChecklist(filters?: ForecastBalanceFilters) {
  const { data: forecastData, isLoading, error } = useForecastBalance(filters);

  const result = useMemo(() => {
    if (!forecastData?.rows) {
      return { 
        openings: [], 
        closures: [], 
        groupedOpenings: [],
        groupedClosures: [],
        locationGroupedOpenings: [],
        locationGroupedClosures: [],
        totalOpeningsFTE: 0, 
        totalClosuresFTE: 0 
      };
    }

    const allOpenings: ChecklistPositionToOpen[] = [];
    const allClosures: ChecklistPositionToClose[] = [];

    for (const row of forecastData.rows) {
      allOpenings.push(...extractOpeningsFromRow(row));
      allClosures.push(...extractClosuresFromRow(row));
    }

    const totalOpeningsFTE = allOpenings.reduce((sum, o) => sum + o.fte * o.count, 0);
    const totalClosuresFTE = allClosures.reduce((sum, c) => sum + c.fte * c.count, 0);

    return {
      openings: allOpenings,
      closures: allClosures,
      groupedOpenings: [],
      groupedClosures: [],
      locationGroupedOpenings: groupOpeningsByLocation(allOpenings),
      locationGroupedClosures: groupClosuresByLocation(allClosures),
      totalOpeningsFTE,
      totalClosuresFTE,
    };
  }, [forecastData]);

  return {
    ...result,
    isLoading,
    error,
    shortageCount: forecastData?.shortageCount ?? 0,
    surplusCount: forecastData?.surplusCount ?? 0,
  };
}
