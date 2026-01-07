import { useMemo } from 'react';
import { useForecastBalance, ForecastBalanceRow, PositionChange, ClosureRecommendation } from './useForecastBalance';

export interface ChecklistPositionToOpen {
  id: string;
  skillType: string;
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
  facilityName: string;
  departmentName: string;
  shift: 'Day' | 'Night';
  employmentType: 'Full-Time' | 'Part-Time' | 'PRN';
  fte: number;
  count: number;
  source: 'open-reqs' | 'employed';
}

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

function groupOpeningsBySkillType(openings: ChecklistPositionToOpen[]): OpeningSkillGroup[] {
  const skillTypeMap = new Map<string, OpeningSkillGroup>();

  for (const item of openings) {
    if (!skillTypeMap.has(item.skillType)) {
      skillTypeMap.set(item.skillType, {
        skillType: item.skillType,
        totalFTE: 0,
        totalCount: 0,
        byEmploymentType: {
          'Full-Time': [],
          'Part-Time': [],
          'PRN': [],
        },
      });
    }

    const group = skillTypeMap.get(item.skillType)!;
    group.byEmploymentType[item.employmentType].push(item);
    group.totalFTE += item.fte * item.count;
    group.totalCount += item.count;
  }

  return Array.from(skillTypeMap.values());
}

function groupClosuresByCombinedKey(closures: ChecklistPositionToClose[]): ClosureCombinedGroup[] {
  const groupMap = new Map<string, ClosureCombinedGroup>();

  for (const item of closures) {
    const groupKey = `${item.skillType}-${item.employmentType}-${item.source}`;
    
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        groupKey,
        skillType: item.skillType,
        employmentType: item.employmentType,
        source: item.source,
        totalFTE: 0,
        totalCount: 0,
        items: [],
      });
    }

    const group = groupMap.get(groupKey)!;
    group.items.push(item);
    group.totalFTE += item.fte * item.count;
    group.totalCount += item.count;
  }

  return Array.from(groupMap.values());
}

export function useForecastChecklist() {
  const { data: forecastData, isLoading, error } = useForecastBalance();

  const { openings, closures, groupedOpenings, groupedClosures, totalOpeningsFTE, totalClosuresFTE } = useMemo(() => {
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
      groupedOpenings: groupOpeningsBySkillType(allOpenings),
      groupedClosures: groupClosuresByCombinedKey(allClosures),
      totalOpeningsFTE,
      totalClosuresFTE,
    };
  }, [forecastData]);

  return {
    openings,
    closures,
    groupedOpenings,
    groupedClosures,
    totalOpeningsFTE,
    totalClosuresFTE,
    isLoading,
    error,
    shortageCount: forecastData?.shortageCount ?? 0,
    surplusCount: forecastData?.surplusCount ?? 0,
  };
}
