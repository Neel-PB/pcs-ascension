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

function getEmploymentTypeLabel(fteValue: number): 'Full-Time' | 'Part-Time' | 'PRN' {
  if (fteValue >= 0.75) return 'Full-Time';
  if (fteValue >= 0.3) return 'Part-Time';
  return 'PRN';
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

export function useForecastChecklist() {
  const { data: forecastData, isLoading, error } = useForecastBalance();

  const { openings, closures, totalOpeningsFTE, totalClosuresFTE } = useMemo(() => {
    if (!forecastData?.rows) {
      return { openings: [], closures: [], totalOpeningsFTE: 0, totalClosuresFTE: 0 };
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
      totalOpeningsFTE,
      totalClosuresFTE,
    };
  }, [forecastData]);

  return {
    openings,
    closures,
    totalOpeningsFTE,
    totalClosuresFTE,
    isLoading,
    error,
    shortageCount: forecastData?.shortageCount ?? 0,
    surplusCount: forecastData?.surplusCount ?? 0,
  };
}
