import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  useForecastPositionsToOpenWithChildren, 
  ForecastPositionToOpenWithChildren, 
  VALID_FTE_VALUES, 
  useAddChildPosition, 
  useUpdateChildFte, 
  useDeleteChildPosition 
} from "@/hooks/useForecastPositions";
import { validateFteAllocation } from "@/lib/fteValidation";
import { cn } from "@/lib/utils";

interface SidebarPositionsToOpenProps {
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function SidebarPositionsToOpen({
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: SidebarPositionsToOpenProps) {
  const { data: positions = [], isLoading } = useForecastPositionsToOpenWithChildren();

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
          <TrendingUp className="h-3.5 w-3.5" />
          Positions to Open
        </h3>
        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5" />
          Positions to Open
        </h3>
        <Badge variant="secondary" className="text-xs">
          {filteredPositions.length} | {totalFte.toFixed(1)} FTE
        </Badge>
      </div>
      
      {filteredPositions.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground border rounded-md bg-muted/20">
          No positions to open
        </div>
      ) : (
        <ScrollArea className="h-[300px] border rounded-md">
          <div className="divide-y divide-border">
            {filteredPositions.map((position) => (
              <SidebarPositionRow key={position.id} position={position} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

interface SidebarPositionRowProps {
  position: ForecastPositionToOpenWithChildren;
}

function SidebarPositionRow({ position }: SidebarPositionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const addChild = useAddChildPosition();
  const updateFte = useUpdateChildFte();
  const deleteChild = useDeleteChildPosition();

  const validation = validateFteAllocation(Number(position.fte), position.childrenFteSum);

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
        style={{ overflow: isExpanded ? "visible" : "hidden" }}
      >
        <div className="bg-muted/20 px-3 py-2 space-y-2">
          <p className="text-xs text-muted-foreground">{position.reason_to_open}</p>
          
          {/* Child Positions */}
          {position.children.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-2 bg-background rounded-md p-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {child.skill_type}
                </p>
              </div>
              <Select
                value={child.fte.toString()}
                onValueChange={(val) => updateFte.mutate({ childId: child.id, fte: parseFloat(val) })}
                disabled={updateFte.isPending}
              >
                <SelectTrigger className="w-20 h-7 text-xs">
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
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChild.mutate(child.id);
                }}
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
            className="w-full h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              addChild.mutate({ parentId: position.id, fte: 1.0 });
            }}
            disabled={addChild.isPending}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Position
          </Button>

          {/* Running Total */}
          {position.children.length > 0 && (
            <div className={cn(
              "text-xs font-medium pt-1 border-t border-border",
              validation.isValid && "text-green-600",
              !validation.isValid && validation.status !== 'empty' && "text-yellow-600"
            )}>
              Total: {position.childrenFteSum.toFixed(2)} / {Number(position.fte).toFixed(2)} FTE
              {validation.isValid && ' ✓'}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
