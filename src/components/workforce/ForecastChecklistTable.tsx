import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useForecastChecklist } from '@/hooks/useForecastChecklist';
import { ForecastChecklistLocationGroup } from './ForecastChecklistLocationGroup';
import { ForecastBalanceFilters } from '@/hooks/useForecastBalance';

export interface ForecastChecklistTableProps {
  type: 'shortage' | 'surplus';
  filters?: ForecastBalanceFilters;
}

export function ForecastChecklistTable({ type, filters }: ForecastChecklistTableProps) {
  const { locationGroupedOpenings, locationGroupedClosures, isLoading } = useForecastChecklist(filters);

  const groups = type === 'shortage' ? locationGroupedOpenings : locationGroupedClosures;
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
          <div className="p-6 text-center text-[11px] text-muted-foreground">
            No {type === 'shortage' ? 'positions to open' : 'positions to close'} recommended
          </div>
        ) : (
          <div className="overflow-y-auto max-h-full">
            {groups.map((group) => (
              <ForecastChecklistLocationGroup 
                key={group.groupKey} 
                group={group} 
                type={type}
              />
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
