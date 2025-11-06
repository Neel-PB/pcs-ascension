import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ApprovalButtons } from "./ApprovalButtons";
import { 
  ForecastPositionToClose,
  useEmployeesForClosureGap,
  useSaveEmployeeSelection,
  useApprovePositionToClose,
  useRejectPositionToClose,
  useRevertPositionToClose
} from "@/hooks/useForecastPositions";
import { validateFteAllocation } from "@/lib/fteValidation";
import { Position } from "@/types/position";

interface PositionClosureRowProps {
  position: ForecastPositionToClose;
  isAdmin: boolean;
}

export function PositionClosureRow({ position, isAdmin }: PositionClosureRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    position.selected_position_ids || []
  );

  const { data: employees = [], isLoading } = useEmployeesForClosureGap(position);
  const saveSelection = useSaveEmployeeSelection();
  
  const { mutate: approveClose, isPending: isApprovingClose } = useApprovePositionToClose();
  const { mutate: rejectClose, isPending: isRejectingClose } = useRejectPositionToClose();
  const { mutate: revertClose, isPending: isRevertingClose } = useRevertPositionToClose();

  // Calculate selected FTE sum and validation
  const selectedEmployees = useMemo(() => 
    employees.filter(e => selectedIds.includes(e.id)),
    [employees, selectedIds]
  );

  const selectedFteSum = useMemo(() => 
    selectedEmployees.reduce((sum, emp) => sum + Number(emp.FTE || 0), 0),
    [selectedEmployees]
  );

  const validation = useMemo(() => 
    validateFteAllocation(Number(position.fte), selectedFteSum),
    [position.fte, selectedFteSum]
  );

  // Debounced save
  const handleToggle = (employeeId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedIds, employeeId]
      : selectedIds.filter(id => id !== employeeId);
    
    setSelectedIds(newSelection);
    
    // Auto-save selection
    saveSelection.mutate({ 
      closureId: position.id, 
      selectedPositionIds: newSelection 
    });
  };

  const handleApprove = () => {
    if (position.status === 'approved') {
      revertClose(position.id);
    } else {
      approveClose(position.id);
    }
  };

  const handleReject = () => {
    if (position.status === 'rejected') {
      revertClose(position.id);
    } else {
      rejectClose(position.id);
    }
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
    <div className="border-b last:border-b-0">
      {/* Parent Row */}
      <div
        className="grid items-center hover:bg-muted/50 transition-colors"
        style={{
          gridTemplateColumns: "40px 120px 180px 180px 150px 1fr 100px 80px 180px",
        }}
      >
        {/* Expand/Collapse */}
        <div className="px-3 py-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-accent rounded p-1 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
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

        {/* Actions */}
        <div className="px-3 py-3">
          <ApprovalButtons
            status={position.status}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isApprovingClose || isRejectingClose || isRevertingClose}
            disabled={!isAdmin}
          />
        </div>
      </div>

      {/* Expanded Section - Employee Selection */}
      {isExpanded && (
        <div className="bg-muted/30 border-t">
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Select Employees to Close</h3>
              <Badge variant="outline" className="ml-auto">
                {employees.length} matching employees
              </Badge>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading employees...
              </div>
            ) : employees.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No employees found matching this criteria</p>
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[300px] border rounded-md bg-background">
                  <div className="space-y-1 p-2">
                    {employees.map((employee) => {
                      const isSelected = selectedIds.includes(employee.id);
                      return (
                        <label
                          key={employee.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                            "hover:bg-muted/50",
                            isSelected && "bg-primary/5 border border-primary/20"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleToggle(employee.id, checked as boolean)
                            }
                          />
                          <div className="flex-1 grid grid-cols-[1fr_200px_80px] gap-4">
                            <div>
                              <p className="font-medium text-sm">{employee.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{employee.employeeId}</p>
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {employee.jobTitle}
                            </div>
                            <div className="text-sm font-medium text-right">
                              {Number(employee.FTE || 0).toFixed(2)} FTE
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
                      Select employees to match the FTE gap (within ±0.2 tolerance)
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
