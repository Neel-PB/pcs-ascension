import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DepartmentSkillGroup } from '@/hooks/useForecastChecklist';
import { ForecastChecklistPositionDetail } from './ForecastChecklistPositionDetail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateSelectionSummary } from '@/hooks/useReconfiguredRecommendation';

interface ForecastChecklistDeptSkillGroupProps {
  group: DepartmentSkillGroup;
  type: 'shortage' | 'surplus';
  selectedIds?: Set<string>;
  onToggleSelection?: (detailId: string) => void;
  onReconfigure?: () => void;
  showSelection?: boolean;
}

export function ForecastChecklistDeptSkillGroup({ 
  group, 
  type,
  selectedIds = new Set(),
  onToggleSelection,
  onReconfigure,
  showSelection = false,
}: ForecastChecklistDeptSkillGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fteColor = type === 'shortage' ? 'text-emerald-600' : 'text-red-600';
  const isSurplus = type === 'surplus';

  // Calculate selection summary for surplus groups
  const selectionSummary = useMemo(() => {
    if (!isSurplus || !showSelection) return null;
    return calculateSelectionSummary(group, selectedIds);
  }, [group, selectedIds, isSurplus, showSelection]);

  const hasSelections = selectionSummary && selectionSummary.selectedFTE > 0;
  const hasUnselectedClosures = selectionSummary && selectionSummary.unselectedFTE > 0.01;

  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 pl-5 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-[11px] truncate">
            {group.departmentName} • {group.skillType}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {/* Show selection indicator when there are selections */}
          {hasSelections && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
              {selectionSummary.selectedFTE.toFixed(1)} / {selectionSummary.recommendedFTE.toFixed(1)}
            </Badge>
          )}
          <span className={`text-[11px] font-medium tabular-nums ${fteColor}`}>
            {group.totalFTE.toFixed(1)} FTE
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="pl-8">
              {group.details.map((detail) => (
                <ForecastChecklistPositionDetail 
                  key={detail.id} 
                  detail={detail} 
                  type={type}
                  isSelected={selectedIds.has(detail.id)}
                  onToggleSelection={onToggleSelection}
                  showSelection={showSelection && isSurplus}
                />
              ))}
            </div>

            {/* Selection summary and reconfigure button for surplus groups */}
            {isSurplus && showSelection && selectionSummary && (
              <div className="pl-8 pr-2 py-2 bg-muted/20 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      Selected: {selectionSummary.selectedFTE.toFixed(1)} of {selectionSummary.recommendedFTE.toFixed(1)} FTE
                    </span>
                    {hasUnselectedClosures && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
                            +{selectionSummary.unselectedFTE.toFixed(1)} FTE to open
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[220px]">
                          Unselected closures will be added to positions to open
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {hasUnselectedClosures && onReconfigure && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onReconfigure();
                      }}
                      className="h-6 text-[10px] px-2"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reconfigure
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
