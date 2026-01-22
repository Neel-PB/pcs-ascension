import { useState, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useForecastChecklist } from '@/hooks/useForecastChecklist';
import { ForecastChecklistLocationGroup } from './ForecastChecklistLocationGroup';
import { ForecastBalanceFilters } from '@/hooks/useForecastBalance';
import { toast } from 'sonner';

export interface ForecastChecklistTableProps {
  type: 'shortage' | 'surplus';
  filters?: ForecastBalanceFilters;
}

export function ForecastChecklistTable({ type, filters }: ForecastChecklistTableProps) {
  const { locationGroupedOpenings, locationGroupedClosures, isLoading } = useForecastChecklist(filters);

  // State for tracking selected closures: Map<locationGroupKey, Map<deptGroupKey, Set<detailIds>>>
  const [selectedClosures, setSelectedClosures] = useState<Map<string, Map<string, Set<string>>>>(new Map());

  const groups = type === 'shortage' ? locationGroupedOpenings : locationGroupedClosures;
  const count = groups.length;
  const isSurplus = type === 'surplus';

  // Get selections for a specific location group
  const getLocationSelections = useCallback((locationGroupKey: string): Map<string, Set<string>> => {
    return selectedClosures.get(locationGroupKey) || new Map();
  }, [selectedClosures]);

  // Toggle selection for a specific detail within a dept group within a location group
  const handleToggleSelection = useCallback((
    locationGroupKey: string, 
    deptGroupKey: string, 
    detailId: string
  ) => {
    setSelectedClosures(prev => {
      const newMap = new Map(prev);
      
      // Get or create location map
      const locationMap = new Map(prev.get(locationGroupKey) || []);
      
      // Get or create dept set
      const deptSet = new Set(locationMap.get(deptGroupKey) || []);
      
      // Toggle the selection
      if (deptSet.has(detailId)) {
        deptSet.delete(detailId);
      } else {
        deptSet.add(detailId);
      }
      
      locationMap.set(deptGroupKey, deptSet);
      newMap.set(locationGroupKey, locationMap);
      
      return newMap;
    });
  }, []);

  // Handle reconfigure for a specific dept group
  const handleReconfigure = useCallback((locationGroupKey: string, deptGroupKey: string) => {
    // Find the relevant group data
    const locationGroup = groups.find(g => g.groupKey === locationGroupKey);
    const deptGroup = locationGroup?.departmentGroups.find(dg => dg.groupKey === deptGroupKey);
    
    if (!deptGroup) return;

    const locationSelections = selectedClosures.get(locationGroupKey);
    const selectedIds = locationSelections?.get(deptGroupKey) || new Set();
    
    // Calculate unselected FTE
    let unselectedFTE = 0;
    for (const detail of deptGroup.details) {
      if (!selectedIds.has(detail.id)) {
        unselectedFTE += detail.fte * detail.count;
      }
    }

    if (unselectedFTE > 0) {
      toast.info(
        `Reconfiguration: ${unselectedFTE.toFixed(1)} FTE from unselected closures will be added to positions to open for ${deptGroup.departmentName} • ${deptGroup.skillType}`,
        { duration: 5000 }
      );
    }
  }, [groups, selectedClosures]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="p-3 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-lg border border-border bg-card overflow-hidden h-full flex flex-col">
        {count === 0 ? (
          <div className="p-6 text-center text-[11px] text-muted-foreground">
            No {type === 'shortage' ? 'positions to open' : 'positions to close'} recommended
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            {groups.map((group) => (
              <ForecastChecklistLocationGroup 
                key={group.groupKey} 
                group={group} 
                type={type}
                selectedIds={getLocationSelections(group.groupKey)}
                onToggleSelection={(deptGroupKey, detailId) => 
                  handleToggleSelection(group.groupKey, deptGroupKey, detailId)
                }
                onReconfigure={(deptGroupKey) => 
                  handleReconfigure(group.groupKey, deptGroupKey)
                }
                showSelection={isSurplus}
              />
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
