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

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
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
        {/* Content */}
        {count === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No {type === 'shortage' ? 'positions to open' : 'positions to close'} found
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {type === 'shortage' ? (
              shortageData?.map((position) => (
                <CompactPositionBreakdownRow key={position.id} position={position} />
              ))
            ) : (
              surplusData?.map((position) => (
                <CompactPositionClosureRow key={position.id} position={position} />
              ))
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
