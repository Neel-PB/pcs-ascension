import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, FileText, TrendingDown } from "lucide-react";
import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useForecastPositionsToClose, 
  ForecastPositionToClose, 
  useRequisitionsForClosureGap, 
  useSaveEmployeeSelection 
} from "@/hooks/useForecastPositions";
import { validateFteAllocation } from "@/lib/fteValidation";
import { cn } from "@/lib/utils";

interface SidebarPositionsToCloseProps {
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function SidebarPositionsToClose({
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: SidebarPositionsToCloseProps) {
  const { data: positions = [], isLoading } = useForecastPositionsToClose();

  // Filter positions based on selected filters
  const filteredPositions = useMemo(() => {
    let data = positions;
    if (selectedMarket && selectedMarket !== "all-markets") {
      data = data.filter((p) => p.market === selectedMarket);
    }
    if (selectedFacility && selectedFacility !== "all-facilities") {
      data = data.filter((p) => p.facility_id === selectedFacility || p.facility_name === selectedFacility);
    }
    if (selectedDepartment && selectedDepartment !== "all-departments") {
      data = data.filter((p) => p.department_id === selectedDepartment || p.department_name === selectedDepartment);
    }
    return data;
  }, [positions, selectedMarket, selectedFacility, selectedDepartment]);

  const totalFte = useMemo(() => 
    filteredPositions.reduce((sum, p) => sum + Number(p.fte), 0),
    [filteredPositions]
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 flex items-center gap-2">
          <TrendingDown className="h-3.5 w-3.5" />
          Positions to Close
        </h3>
        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <TrendingDown className="h-3.5 w-3.5" />
          Positions to Close
        </h3>
        <Badge variant="secondary" className="text-xs">
          {filteredPositions.length} | {totalFte.toFixed(1)} FTE
        </Badge>
      </div>
      
      {filteredPositions.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground border rounded-md bg-muted/20">
          No positions to close
        </div>
      ) : (
        <ScrollArea className="h-[300px] border rounded-md">
          <div className="divide-y divide-border">
            {filteredPositions.map((position) => (
              <SidebarClosureRow key={position.id} position={position} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

interface SidebarClosureRowProps {
  position: ForecastPositionToClose;
}

function SidebarClosureRow({ position }: SidebarClosureRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    position.selected_position_ids || []
  );

  const { data: requisitions = [], isLoading } = useRequisitionsForClosureGap(position);
  const saveSelection = useSaveEmployeeSelection();

  const selectedFteSum = useMemo(() => 
    requisitions
      .filter(r => selectedIds.includes(r.id))
      .reduce((sum, req) => sum + Number(req.FTE || 0), 0),
    [requisitions, selectedIds]
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
    <div className="bg-background">
      {/* Parent Row */}
      <div
        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{position.department_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {position.facility_name} • {position.skill_type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{Number(position.fte).toFixed(2)}</span>
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
        style={{ overflow: isExpanded ? "visible" : "hidden" }}
      >
        <div className="bg-muted/20 px-3 py-2 space-y-2">
          <p className="text-xs text-muted-foreground">{position.reason_to_close}</p>
          
          <div className="flex items-center gap-2 text-xs">
            <FileText className="w-3 h-3 text-muted-foreground" />
            <span>Select Requisitions to Close</span>
          </div>

          {isLoading ? (
            <div className="text-xs text-muted-foreground p-2">Loading...</div>
          ) : requisitions.length === 0 ? (
            <div className="text-xs text-muted-foreground p-2 bg-background rounded border">
              No matching requisitions
            </div>
          ) : (
            <div className="space-y-1 max-h-[150px] overflow-y-auto">
              {requisitions.map((requisition) => {
                const isSelected = selectedIds.includes(requisition.id);
                return (
                  <label
                    key={requisition.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-xs bg-background",
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
                      className="h-3.5 w-3.5"
                    />
                    <div className="flex-1 min-w-0 truncate">
                      {requisition.positionNum} - {requisition.jobTitle}
                    </div>
                    <span className="font-medium flex-shrink-0">
                      {Number(requisition.FTE || 0).toFixed(2)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Summary */}
          {selectedIds.length > 0 && (
            <div className="text-xs pt-1 border-t border-border">
              <span className={cn(
                "font-medium",
                validation.isValid ? "text-green-600" : "text-yellow-600"
              )}>
                {selectedFteSum.toFixed(2)} / {Number(position.fte).toFixed(2)} FTE
                {validation.isValid && ' ✓'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
