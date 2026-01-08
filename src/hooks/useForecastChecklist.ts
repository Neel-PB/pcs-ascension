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

// New hierarchy: Facility → Skill Type → Details
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

// Legacy interfaces for backward compatibility (can be removed later)
export interface OpeningSkillGroup {
  skillType: string;
  totalFTE: number;
  totalCount: number;
  byEmploymentType: {
    'Full-Time': ChecklistPositionToOpen[];
    'Part-Time': ChecklistPositionToOpen[];
    'PRN': ChecklistPositionToOpen[];
  };
}

export interface ClosureCombinedGroup {
  groupKey: string;
  skillType: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'PRN';
  source: 'open-reqs' | 'employed';
  totalFTE: number;
  totalCount: number;
  items: ChecklistPositionToClose[];
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

// New grouping: Facility → Skill Type for Openings
function groupOpeningsByFacility(openings: ChecklistPositionToOpen[]): OpeningFacilityGroup[] {
  const facilityMap = new Map<string, OpeningFacilityGroup>();

  for (const item of openings) {
    if (!facilityMap.has(item.facilityName)) {
      facilityMap.set(item.facilityName, {
        facilityName: item.facilityName,
        totalFTE: 0,
        totalCount: 0,
        skillGroups: [],
      });
    }

    const facilityGroup = facilityMap.get(item.facilityName)!;
    
    // Find or create skill subgroup
    let skillSubGroup = facilityGroup.skillGroups.find(sg => sg.skillType === item.skillType);
    if (!skillSubGroup) {
      skillSubGroup = {
        skillType: item.skillType,
        totalFTE: 0,
        totalCount: 0,
        items: [],
      };
      facilityGroup.skillGroups.push(skillSubGroup);
    }

    skillSubGroup.items.push(item);
    skillSubGroup.totalFTE += item.fte * item.count;
    skillSubGroup.totalCount += item.count;
    
    facilityGroup.totalFTE += item.fte * item.count;
    facilityGroup.totalCount += item.count;
  }

  return Array.from(facilityMap.values());
}

// New grouping: Facility → Skill Type for Closures
function groupClosuresByFacility(closures: ChecklistPositionToClose[]): ClosureFacilityGroup[] {
  const facilityMap = new Map<string, ClosureFacilityGroup>();

  for (const item of closures) {
    if (!facilityMap.has(item.facilityName)) {
      facilityMap.set(item.facilityName, {
        facilityName: item.facilityName,
        totalFTE: 0,
        totalCount: 0,
        skillGroups: [],
      });
    }

    const facilityGroup = facilityMap.get(item.facilityName)!;
    
    // Find or create skill subgroup
    let skillSubGroup = facilityGroup.skillGroups.find(sg => sg.skillType === item.skillType);
    if (!skillSubGroup) {
      skillSubGroup = {
        skillType: item.skillType,
        totalFTE: 0,
        totalCount: 0,
        items: [],
      };
      facilityGroup.skillGroups.push(skillSubGroup);
    }

    skillSubGroup.items.push(item);
    skillSubGroup.totalFTE += item.fte * item.count;
    skillSubGroup.totalCount += item.count;
    
    facilityGroup.totalFTE += item.fte * item.count;
    facilityGroup.totalCount += item.count;
  }

  return Array.from(facilityMap.values());
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
      groupedOpenings: groupOpeningsByFacility(allOpenings),
      groupedClosures: groupClosuresByFacility(allClosures),
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
