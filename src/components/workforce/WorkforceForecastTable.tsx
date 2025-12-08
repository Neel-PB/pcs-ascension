import { TrendingDown, TrendingUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  useForecastPositionsToOpenWithChildren,
  useForecastPositionsToClose,
} from "@/hooks/useForecastPositions";
import { CompactPositionBreakdownRow } from "./CompactPositionBreakdownRow";
import { CompactPositionClosureRow } from "./CompactPositionClosureRow";

interface WorkforceForecastTableProps {
  type: 'shortage' | 'surplus';
}

export function WorkforceForecastTable({ type }: WorkforceForecastTableProps) {
  const { 
    data: shortageData, 
    isLoading: shortageLoading 
  } = useForecastPositionsToOpenWithChildren();
  
  const { 
    data: surplusData, 
    isLoading: surplusLoading 
  } = useForecastPositionsToClose();

  const isLoading = type === 'shortage' ? shortageLoading : surplusLoading;
  const data = type === 'shortage' ? shortageData : surplusData;
  const count = data?.length || 0;

  const title = type === 'shortage' ? 'FTE Shortage' : 'FTE Surplus';
  const subtitle = type === 'shortage' ? 'Positions to Open' : 'Positions to Close';
  const Icon = type === 'shortage' ? TrendingDown : TrendingUp;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="p-3 border-b border-border">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32 mt-1" />
        </div>
        <div className="p-3 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="text-xs text-muted-foreground">{subtitle} ({count})</p>
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div 
          className="grid h-8 items-center bg-muted/20 text-xs font-medium text-muted-foreground border-b border-border"
          style={{
            gridTemplateColumns: "28px 1fr 1fr 60px 36px",
          }}
        >
          <div />
          <div className="px-2">Facility</div>
          <div className="px-2">Department</div>
          <div className="px-2 text-right">FTE</div>
          <div className="text-center">Status</div>
        </div>

        {/* Content */}
        {count === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No {type === 'shortage' ? 'positions to open' : 'positions to close'} found
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            {type === 'shortage' ? (
              shortageData?.map((position) => (
                <CompactPositionBreakdownRow key={position.id} position={position} />
              ))
            ) : (
              surplusData?.map((position) => (
                <CompactPositionClosureRow key={position.id} position={position} />
              ))
            )}
          </ScrollArea>
        )}
      </div>
    </TooltipProvider>
  );
}
