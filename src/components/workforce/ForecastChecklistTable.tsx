import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useForecastChecklist } from '@/hooks/useForecastChecklist';
import { ForecastChecklistOpeningGroup } from './ForecastChecklistOpeningGroup';
import { ForecastChecklistClosureGroup } from './ForecastChecklistClosureGroup';
import { ForecastBalanceFilters } from '@/hooks/useForecastBalance';

export interface ForecastChecklistTableProps {
  type: 'shortage' | 'surplus';
  filters?: ForecastBalanceFilters;
}

export function ForecastChecklistTable({ type, filters }: ForecastChecklistTableProps) {
  const { groupedOpenings, groupedClosures, isLoading } = useForecastChecklist(filters);

  const groups = type === 'shortage' ? groupedOpenings : groupedClosures;
  const count = groups.length;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="p-3 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {count === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No {type === 'shortage' ? 'positions to open' : 'positions to close'} recommended
          </div>
        ) : (
          <div className="overflow-y-auto max-h-full">
            {type === 'shortage' ? (
              groupedOpenings.map((group) => (
                <ForecastChecklistOpeningGroup key={group.facilityName} group={group} />
              ))
            ) : (
              groupedClosures.map((group) => (
                <ForecastChecklistClosureGroup key={group.facilityName} group={group} />
              ))
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
