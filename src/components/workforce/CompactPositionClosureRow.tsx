import { useState, useMemo } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ForecastPositionToClose,
  useRequisitionsForClosureGap,
  useSaveEmployeeSelection,
} from "@/hooks/useForecastPositions";
import { validateFteAllocation } from "@/lib/fteValidation";

interface CompactPositionClosureRowProps {
  position: ForecastPositionToClose;
}

export function CompactPositionClosureRow({ position }: CompactPositionClosureRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    position.selected_position_ids || []
  );

  const { data: requisitions = [], isLoading } = useRequisitionsForClosureGap(position);
  const saveSelection = useSaveEmployeeSelection();

  const getVacancyAge = (statusDate: string | null) => {
    if (!statusDate) return null;
    return differenceInDays(new Date(), new Date(statusDate));
  };

  const getVacancyAgeDisplay = (statusDate: string | null) => {
    const days = getVacancyAge(statusDate);
    if (!days) return "—";
    if (days > 60) return `${days}d`;
    if (days > 30) return `${days}d`;
    return `${days}d`;
  };

  const selectedRequisitions = useMemo(() => 
    requisitions.filter(r => selectedIds.includes(r.id)),
    [requisitions, selectedIds]
  );

  const selectedFteSum = useMemo(() => 
    selectedRequisitions.reduce((sum, req) => sum + Number(req.FTE || 0), 0),
    [selectedRequisitions]
  );

  const validation = useMemo(() => 
    validateFteAllocation(Number(position.fte), selectedFteSum),
    [position.fte, selectedFteSum]
  );

  const handleToggle = (requisitionId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedIds, requisitionId]
      : selectedIds.filter(id => id !== requisitionId);
    
    setSelectedIds(newSelection);
    saveSelection.mutate({ 
      closureId: position.id, 
      selectedPositionIds: newSelection 
    });
  };

  const getValidationIndicator = () => {
    if (selectedIds.length === 0) {
      return <div className="w-3 h-3 rounded-full bg-muted" />;
    }
    if (validation.isValid) {
      return <div className="w-3 h-3 rounded-full bg-green-500" />;
    }
    return <div className="w-3 h-3 rounded-full bg-yellow-500" />;
  };

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Two-line Row Layout */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-2 py-2 hover:bg-muted/30 transition-colors cursor-pointer"
      >
        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>

        {/* Two-line Text Section */}
        <div className="flex-1 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm font-medium truncate">{position.skill_type}</div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>{position.skill_type}</p>
            </TooltipContent>
          </Tooltip>
          <div className="text-xs text-muted-foreground truncate">
            {position.facility_name} • {position.department_name}
          </div>
        </div>

        {/* FTE Value + Status Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-sm font-medium tabular-nums">
            {Number(position.fte).toFixed(2)}
          </div>
          {getValidationIndicator()}
        </div>
      </div>

      {/* Expanded Section */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="bg-muted/20 p-3 space-y-2">
          {/* Full Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Market:</span>{" "}
              <span className="font-medium">{position.market}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Skill Type:</span>{" "}
              <span className="font-medium">{position.skill_type}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Reason:</span>{" "}
              <span className="font-medium">{position.reason_to_close}</span>
            </div>
          </div>

          {/* Requisition Selection */}
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Requisitions to Close</span>
              <Badge variant="outline" className="text-[10px] h-5 ml-auto">
                {requisitions.length} found
              </Badge>
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Loading...
              </div>
            ) : requisitions.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No matching requisitions
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[180px] border rounded bg-background">
                  <div className="p-1.5 space-y-1">
                    {requisitions.map((requisition) => {
                      const isSelected = selectedIds.includes(requisition.id);
                      return (
                        <label
                          key={requisition.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-xs",
                            "hover:bg-muted/50",
                            isSelected && "bg-primary/5 border border-primary/20"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleToggle(requisition.id, checked as boolean)
                            }
                            className="data-[state=checked]:bg-primary h-3.5 w-3.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{requisition.positionNum}</span>
                              <span className="text-muted-foreground">
                                {getVacancyAgeDisplay(requisition.positionStatusDate)}
                              </span>
                            </div>
                            <div className="text-muted-foreground truncate">
                              {requisition.jobTitle}
                            </div>
                          </div>
                          <span className="font-medium whitespace-nowrap">
                            {Number(requisition.FTE || 0).toFixed(2)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Summary */}
                <div className="mt-2 pt-2 border-t border-border space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Selected:</span>
                    <span className="font-medium">
                      {selectedFteSum.toFixed(2)} / {Number(position.fte).toFixed(2)} FTE
                    </span>
                  </div>
                  
                  {selectedIds.length > 0 && (
                    <div>
                      {validation.isValid ? (
                        <Badge variant="default" className="bg-green-500 text-[10px] h-5">
                          ✓ Valid
                        </Badge>
                      ) : validation.status === 'under' ? (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          Under by {Math.abs(validation.difference).toFixed(2)}
                        </Badge>
                      ) : validation.status === 'over' ? (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          Over by {Math.abs(validation.difference).toFixed(2)}
                        </Badge>
                      ) : null}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
