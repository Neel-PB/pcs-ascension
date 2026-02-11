import { useState, useMemo } from "react";
import { ChevronRight, FileText } from "@/lib/icons";
import { motion } from "framer-motion";
import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ForecastPositionToClose,
  useRequisitionsForClosureGap,
  useSaveEmployeeSelection,
} from "@/hooks/useForecastPositions";
import { validateFteAllocation } from "@/lib/fteValidation";

interface PositionClosureRowProps {
  position: ForecastPositionToClose;
}

export function PositionClosureRow({ position }: PositionClosureRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    position.selected_position_ids || []
  );

  const { data: requisitions = [], isLoading } = useRequisitionsForClosureGap(position);
  const saveSelection = useSaveEmployeeSelection();

  // Helper functions for vacancy age
  const getVacancyAge = (statusDate: string | null) => {
    if (!statusDate) return null;
    return differenceInDays(new Date(), new Date(statusDate));
  };

  const getVacancyAgeDisplay = (statusDate: string | null) => {
    const days = getVacancyAge(statusDate);
    if (!days) return "—";
    if (days > 60) return `${days}d - Urgent`;
    if (days > 30) return `${days}d - Attention`;
    return `${days}d - On Track`;
  };

  // Calculate selected FTE sum and validation
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

  // Auto-save selection
  const handleToggle = (requisitionId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedIds, requisitionId]
      : selectedIds.filter(id => id !== requisitionId);
    
    setSelectedIds(newSelection);
    
    // Auto-save selection
    saveSelection.mutate({ 
      closureId: position.id, 
      selectedPositionIds: newSelection 
    });
  };

  // Validation indicator
  const getValidationIndicator = () => {
    if (selectedIds.length === 0) {
      return <div className="w-2 h-2 rounded-full bg-muted" />;
    }
    if (validation.isValid) {
      return <div className="w-2 h-2 rounded-full bg-green-500" />;
    }
    return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
  };

  return (
    <>
      {/* Parent Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="grid items-center border-b hover:bg-muted/50 transition-colors cursor-pointer"
        style={{
          gridTemplateColumns: "40px 120px 180px 180px 150px 1fr 100px 80px",
          minHeight: "48px",
        }}
      >
        {/* Expand Button */}
        <div className="px-3 flex items-center justify-center">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Market */}
        <div className="px-3 py-3 truncate text-sm">{position.market}</div>

        {/* Facility */}
        <div className="px-3 py-3 truncate text-sm">{position.facility_name}</div>

        {/* Department */}
        <div className="px-3 py-3 truncate text-sm">{position.department_name}</div>

        {/* Skill Type */}
        <div className="px-3 py-3 truncate text-sm">{position.skill_type}</div>

        {/* Reason to Close */}
        <div className="px-3 py-3 truncate text-sm">{position.reason_to_close}</div>

        {/* FTE Gap */}
        <div className="px-3 py-3 text-sm font-medium">{Number(position.fte).toFixed(2)}</div>

        {/* Status */}
        <div className="px-3 py-3 flex justify-center">
          {getValidationIndicator()}
        </div>
      </div>

      {/* Expanded Section - Requisition Selection */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        style={{ overflow: isExpanded ? "visible" : "hidden" }}
        className="border-b"
      >
        <div className="bg-muted/20">
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Select Requisitions to Close</h3>
              <Badge variant="outline" className="ml-auto">
                {requisitions.length} matching requisitions
              </Badge>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading requisitions...
              </div>
            ) : requisitions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No requisitions found matching this criteria</p>
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[300px] border rounded-md bg-background">
                  <div className="space-y-1 p-2">
                    {requisitions.map((requisition) => {
                      const isSelected = selectedIds.includes(requisition.id);
                      return (
                        <label
                          key={requisition.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
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
                            className="data-[state=checked]:bg-primary"
                          />
                          <div className="flex-1 grid grid-cols-[140px_180px_220px_160px_80px] gap-4">
                            <div className="text-sm">{requisition.positionNum}</div>
                            <div className="text-sm">
                              {getVacancyAgeDisplay(requisition.positionStatusDate)}
                            </div>
                            <div className="text-sm truncate">{requisition.jobTitle}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {requisition.employmentType}
                            </div>
                            <div className="text-sm font-medium text-right">
                              {Number(requisition.FTE || 0).toFixed(2)} FTE
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>

                <Separator className="my-3" />

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Selected FTE:</span>
                    <span className="font-medium">
                      {selectedFteSum.toFixed(2)} / {Number(position.fte).toFixed(2)} FTE
                    </span>
                  </div>
                  
                  {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2">
                      {validation.isValid ? (
                        <Badge variant="default" className="bg-green-500">
                          ✓ Valid allocation (within ±0.2 FTE)
                        </Badge>
                      ) : validation.status === 'under' ? (
                        <Badge variant="secondary">
                          ⚠️ Under by {Math.abs(validation.difference).toFixed(2)} FTE
                        </Badge>
                      ) : validation.status === 'over' ? (
                        <Badge variant="secondary">
                          ⚠️ Over by {Math.abs(validation.difference).toFixed(2)} FTE
                        </Badge>
                      ) : null}
                    </div>
                  )}

                  {selectedIds.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Select requisitions to match the FTE gap (within ±0.2 tolerance)
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
