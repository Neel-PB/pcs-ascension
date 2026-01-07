import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useForecastChecklist } from '@/hooks/useForecastChecklist';
import { ForecastChecklistOpeningRow } from './ForecastChecklistOpeningRow';
import { ForecastChecklistClosureRow } from './ForecastChecklistClosureRow';

interface ForecastChecklistTableProps {
  type: 'shortage' | 'surplus';
}

export function ForecastChecklistTable({ type }: ForecastChecklistTableProps) {
  const { openings, closures, isLoading } = useForecastChecklist();

  const items = type === 'shortage' ? openings : closures;
  const count = items.length;

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
              openings.map((item) => (
                <ForecastChecklistOpeningRow key={item.id} item={item} />
              ))
            ) : (
              closures.map((item) => (
                <ForecastChecklistClosureRow key={item.id} item={item} />
              ))
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
