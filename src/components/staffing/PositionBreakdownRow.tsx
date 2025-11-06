import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ForecastPositionToOpenWithChildren, VALID_FTE_VALUES, useAddChildPosition, useUpdateChildFte, useDeleteChildPosition } from "@/hooks/useForecastPositions";
import { validateFteAllocation } from "@/lib/fteValidation";
import { cn } from "@/lib/utils";

interface PositionBreakdownRowProps {
  position: ForecastPositionToOpenWithChildren;
}

export function PositionBreakdownRow({ position }: PositionBreakdownRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const addChild = useAddChildPosition();
  const updateFte = useUpdateChildFte();
  const deleteChild = useDeleteChildPosition();

  const validation = validateFteAllocation(Number(position.fte), position.childrenFteSum);

  const handleAddPosition = () => {
    addChild.mutate({ parentId: position.id, fte: 1.0 });
  };

  const handleUpdateFte = (childId: string, fte: number) => {
    updateFte.mutate({ childId, fte });
  };

  const handleDeleteChild = (childId: string) => {
    deleteChild.mutate(childId);
  };

  const getStatusIcon = () => {
    if (validation.status === 'empty') {
      return <div className="w-5 h-5 rounded-full bg-muted" />;
    }
    if (validation.isValid) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <div className="border-b border-border">
      {/* Parent Row */}
      <div
        className="grid h-12 items-center hover:bg-muted/30 transition-colors cursor-pointer"
        style={{
          gridTemplateColumns: "40px 120px 180px 180px 150px 1fr 100px 80px",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
        <div className="px-3 truncate text-sm">{position.market}</div>
        <div className="px-3 truncate text-sm">{position.facility_name}</div>
        <div className="px-3 truncate text-sm">{position.department_name}</div>
        <div className="px-3 truncate text-sm">{position.skill_type}</div>
        <div className="px-3 truncate text-sm">{position.reason_to_open}</div>
        <div className="px-3 text-sm font-medium">{Number(position.fte).toFixed(2)}</div>
        <div className="flex items-center justify-center">
          {getStatusIcon()}
        </div>
      </div>

      {/* Expanded Children Section */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        style={{ overflow: "hidden" }}
      >
        <div className="bg-muted/20 p-4 space-y-3">
          {/* Child Positions */}
          <div className="space-y-2">
            {position.children.map((child) => (
              <div
                key={child.id}
                className="grid items-center bg-background rounded-md p-2 h-10"
                style={{
                  gridTemplateColumns: "120px 180px 180px 150px 1fr 120px 40px",
                }}
              >
                <div className="px-3 truncate text-sm text-muted-foreground">
                  {child.market}
                </div>
                <div className="px-3 truncate text-sm text-muted-foreground">
                  {child.facility_name}
                </div>
                <div className="px-3 truncate text-sm text-muted-foreground">
                  {child.department_name}
                </div>
                <div className="px-3 truncate text-sm text-muted-foreground">
                  {child.skill_type}
                </div>
                <div /> {/* Empty space for reason */}
                <div className="px-3">
                  <Select
                    value={child.fte.toString()}
                    onValueChange={(val) => handleUpdateFte(child.id, parseFloat(val))}
                    disabled={updateFte.isPending}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_FTE_VALUES.map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {val.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleDeleteChild(child.id)}
                    disabled={deleteChild.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Position Button */}
            <div className="flex items-center justify-center py-2">
              <Button
                size="sm"
                onClick={handleAddPosition}
                disabled={addChild.isPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Position
              </Button>
            </div>

            {/* Running Total */}
            {position.children.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className={cn(
                  "text-sm font-medium",
                  validation.isValid && "text-green-600",
                  !validation.isValid && validation.status !== 'empty' && "text-yellow-600"
                )}>
                  Total: {position.childrenFteSum.toFixed(2)} FTE / {Number(position.fte).toFixed(2)} FTE
                  {validation.status === 'under' && ` (${Math.abs(validation.difference).toFixed(2)} remaining)`}
                  {validation.status === 'over' && ` (${validation.difference.toFixed(2)} over)`}
                  {validation.isValid && ' ✓'}
                </div>
                {!validation.isValid && validation.status !== 'empty' && (
                  <div className="text-xs text-muted-foreground">
                    Allocation must be within ±0.2 FTE
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
