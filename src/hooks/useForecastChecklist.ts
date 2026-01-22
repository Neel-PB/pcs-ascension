import { useMemo } from 'react';
import { useForecastBalance, ForecastBalanceRow, PositionChange, ClosureRecommendation, ForecastBalanceFilters } from './useForecastBalance';

export interface ChecklistPositionToOpen {
  id: string;
  skillType: string;
  region: string;
  market: string;
  facilityName: string;
  departmentName: string;
  shift: 'Day' | 'Night';
  employmentType: 'Full-Time' | 'Part-Time' | 'PRN';
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
  shift: 'Day' | 'Night';
  employmentType: 'Full-Time' | 'Part-Time' | 'PRN';
  fte: number;
  count: number;
  source: 'open-reqs' | 'employed';
}

// Level 3: Individual position detail (Shift | FT/PT/PRN | FTE with count badge)
export interface PositionDetail {
  id: string;
  shift: 'Day' | 'Night';
  employmentType: 'Full-Time' | 'Part-Time' | 'PRN';
  fte: number;
  count: number;
  source?: 'open-reqs' | 'employed'; // Only for closures
}

// Level 2: Department + Skill Type + Shift group
export interface DepartmentSkillGroup {
  departmentName: string;
  skillType: string;
  shift: 'Day' | 'Night';
  groupKey: string;
  totalFTE: number;
  totalCount: number;
  details: PositionDetail[];
}

// Level 1: Region/Market/Facility group
export interface FacilityLocationGroup {
  region: string;
  market: string;
  facilityName: string;
  groupKey: string;
  totalFTE: number;
  totalCount: number;
  departmentGroups: DepartmentSkillGroup[];
}

// Legacy interfaces for backward compatibility
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

function extractOpenings(
  row: ForecastBalanceRow,
  positions: PositionChange[],
  employmentType: 'Full-Time' | 'Part-Time' | 'PRN'
): ChecklistPositionToOpen[] {
  return positions
    .filter(p => p.action === 'open' && p.count > 0)
    .map((p, idx) => ({
      id: `${row.id}-open-${employmentType}-${idx}`,
      skillType: row.skillType,
      region: row.region,
      market: row.market,
      facilityName: row.facilityName,
      departmentName: row.departmentName,
      shift: row.shift,
      employmentType,
      fte: p.fteValue,
      count: p.count,
    }));
}

function extractClosures(
  row: ForecastBalanceRow,
  closure: ClosureRecommendation,
  employmentType: 'Full-Time' | 'Part-Time' | 'PRN'
): ChecklistPositionToClose[] {
  const items: ChecklistPositionToClose[] = [];

  // From open requisitions first (priority)
  closure.fromReqs.forEach((p, idx) => {
    if (p.count > 0) {
      items.push({
        id: `${row.id}-close-reqs-${employmentType}-${idx}`,
        skillType: row.skillType,
        region: row.region,
        market: row.market,
        facilityName: row.facilityName,
        departmentName: row.departmentName,
        shift: row.shift,
        employmentType,
        fte: p.fteValue,
        count: p.count,
        source: 'open-reqs',
      });
    }
  });

  // From employed positions
  closure.fromEmployed.forEach((p, idx) => {
    if (p.count > 0) {
      items.push({
        id: `${row.id}-close-emp-${employmentType}-${idx}`,
        skillType: row.skillType,
        region: row.region,
        market: row.market,
        facilityName: row.facilityName,
        departmentName: row.departmentName,
        shift: row.shift,
        employmentType,
        fte: p.fteValue,
        count: p.count,
        source: 'employed',
      });
    }
  });

  return items;
}

// New 3-level grouping for openings: Location → Department/Skill → Details
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

// New 3-level grouping for closures: Location → Department/Skill → Details
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
      // Extract openings from shortage rows
      if (row.gapType === 'shortage' || row.gapType === 'split-imbalanced') {
        allOpenings.push(...extractOpenings(row, row.recommendation.ft, 'Full-Time'));
        allOpenings.push(...extractOpenings(row, row.recommendation.pt, 'Part-Time'));
        allOpenings.push(...extractOpenings(row, row.recommendation.prn, 'PRN'));
      }

      // Extract closures from surplus rows
      if (row.gapType === 'surplus' || row.gapType === 'split-imbalanced') {
        allClosures.push(...extractClosures(row, row.recommendation.ftClosure, 'Full-Time'));
        allClosures.push(...extractClosures(row, row.recommendation.ptClosure, 'Part-Time'));
        allClosures.push(...extractClosures(row, row.recommendation.prnClosure, 'PRN'));
      }
    }

    const totalOpeningsFTE = allOpenings.reduce((sum, o) => sum + o.fte * o.count, 0);
    const totalClosuresFTE = allClosures.reduce((sum, c) => sum + c.fte * c.count, 0);

    return {
      openings: allOpenings,
      closures: allClosures,
      groupedOpenings: [], // Legacy - no longer used
      groupedClosures: [], // Legacy - no longer used
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
