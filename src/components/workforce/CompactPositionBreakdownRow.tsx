import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ForecastPositionToOpenWithChildren, VALID_FTE_VALUES, useAddChildPosition, useUpdateChildFte, useDeleteChildPosition } from "@/hooks/useForecastPositions";
import { validateFteAllocation } from "@/lib/fteValidation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CompactPositionBreakdownRowProps {
  position: ForecastPositionToOpenWithChildren;
}

export function CompactPositionBreakdownRow({ position }: CompactPositionBreakdownRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const addChild = useAddChildPosition();
  const updateFte = useUpdateChildFte();
  const deleteChild = useDeleteChildPosition();

  const validation = validateFteAllocation(Number(position.fte), position.childrenFteSum);

  const handleAddPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    addChild.mutate({ parentId: position.id, fte: 1.0 });
  };

  const handleUpdateFte = (childId: string, fte: number) => {
    updateFte.mutate({ childId, fte });
  };

  const handleDeleteChild = (childId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChild.mutate(childId);
  };

  const getStatusIcon = () => {
    if (validation.status === 'empty') {
      return <div className="w-4 h-4 rounded-full bg-muted" />;
    }
    if (validation.isValid) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Compact Parent Row */}
      <div
        className="grid h-10 items-center hover:bg-muted/30 transition-colors cursor-pointer text-xs"
        style={{
          gridTemplateColumns: "28px 1fr 1fr 60px 36px",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="px-2 truncate">{position.facility_name}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>{position.facility_name}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="px-2 truncate">{position.department_name}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>{position.department_name}</p>
          </TooltipContent>
        </Tooltip>
        <div className="px-2 font-medium text-right">{Number(position.fte).toFixed(2)}</div>
        <div className="flex items-center justify-center">
          {getStatusIcon()}
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
              <span className="font-medium">{position.reason_to_open}</span>
            </div>
          </div>

          {/* Child Positions */}
          <div className="space-y-1.5 mt-2">
            {position.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-2 bg-background rounded p-2"
              >
                <div className="flex-1 text-xs truncate text-muted-foreground">
                  {child.facility_name} • {child.department_name}
                </div>
                <Select
                  value={child.fte.toString()}
                  onValueChange={(val) => handleUpdateFte(child.id, parseFloat(val))}
                  disabled={updateFte.isPending}
                >
                  <SelectTrigger className="w-16 h-7 text-xs">
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
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => handleDeleteChild(child.id, e)}
                  disabled={deleteChild.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}

            {/* Add Position Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddPosition}
              disabled={addChild.isPending}
              className="w-full h-7 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Position
            </Button>

            {/* Running Total */}
            {position.children.length > 0 && (
              <div className={cn(
                "text-xs pt-2 border-t border-border",
                validation.isValid && "text-green-600",
                !validation.isValid && validation.status !== 'empty' && "text-yellow-600"
              )}>
                Total: {position.childrenFteSum.toFixed(2)} / {Number(position.fte).toFixed(2)} FTE
                {validation.status === 'under' && ` (${Math.abs(validation.difference).toFixed(2)} remaining)`}
                {validation.status === 'over' && ` (${validation.difference.toFixed(2)} over)`}
                {validation.isValid && ' ✓'}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
