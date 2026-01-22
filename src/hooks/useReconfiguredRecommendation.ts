import { useMemo } from 'react';
import { PositionDetail, DepartmentSkillGroup } from './useForecastChecklist';

export interface ReconfiguredResult {
  // FTE that was NOT selected for closure (needs to be added to openings)
  unselectedClosureFTE: {
    ft: number;
    pt: number;
    prn: number;
  };
  // Reconfigured openings based on unselected closures
  additionalOpenings: {
    ft: number;
    pt: number;
    prn: number;
  };
  // Whether reconfiguration is needed
  hasUnselectedClosures: boolean;
}

interface ReconfigureParams {
  closureDetails: PositionDetail[];
  selectedClosureIds: Set<string>;
  shift: 'Day' | 'Night';
}

/**
 * Calculate reconfigured openings based on user's closure selections.
 * Any closure not selected needs to be compensated with additional openings.
 */
export function useReconfiguredRecommendation({
  closureDetails,
  selectedClosureIds,
  shift,
}: ReconfigureParams): ReconfiguredResult {
  return useMemo(() => {
    // Filter to only this shift's closures
    const shiftClosures = closureDetails.filter(d => d.shift === shift);
    
    // Calculate unselected FTE by employment type
    const unselectedClosureFTE = {
      ft: 0,
      pt: 0,
      prn: 0,
    };

    for (const detail of shiftClosures) {
      if (!selectedClosureIds.has(detail.id)) {
        const fte = detail.fte * detail.count;
        switch (detail.employmentType) {
          case 'Full-Time':
            unselectedClosureFTE.ft += fte;
            break;
          case 'Part-Time':
            unselectedClosureFTE.pt += fte;
            break;
          case 'PRN':
            unselectedClosureFTE.prn += fte;
            break;
        }
      }
    }

    const totalUnselected = unselectedClosureFTE.ft + unselectedClosureFTE.pt + unselectedClosureFTE.prn;
    const hasUnselectedClosures = totalUnselected > 0.01; // Small epsilon for floating point

    // The additional openings needed equals the unselected closures
    // This maintains the original target FTE balance
    const additionalOpenings = { ...unselectedClosureFTE };

    return {
      unselectedClosureFTE,
      additionalOpenings,
      hasUnselectedClosures,
    };
  }, [closureDetails, selectedClosureIds, shift]);
}

/**
 * Calculate the total selected vs recommended FTE for a department/skill group
 */
export function calculateSelectionSummary(
  deptGroup: DepartmentSkillGroup,
  selectedIds: Set<string>
): {
  recommendedFTE: number;
  selectedFTE: number;
  unselectedFTE: number;
  selectionPercentage: number;
} {
  const recommendedFTE = deptGroup.totalFTE;
  
  let selectedFTE = 0;
  for (const detail of deptGroup.details) {
    if (selectedIds.has(detail.id)) {
      selectedFTE += detail.fte * detail.count;
    }
  }

  const unselectedFTE = recommendedFTE - selectedFTE;
  const selectionPercentage = recommendedFTE > 0 
    ? (selectedFTE / recommendedFTE) * 100 
    : 0;

  return {
    recommendedFTE,
    selectedFTE,
    unselectedFTE,
    selectionPercentage,
  };
}
