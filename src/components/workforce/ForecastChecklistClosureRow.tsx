import { Badge } from '@/components/ui/badge';
import { ChecklistPositionToClose } from '@/hooks/useForecastChecklist';

interface ForecastChecklistClosureRowProps {
  item: ChecklistPositionToClose;
}

export function ForecastChecklistClosureRow({ item }: ForecastChecklistClosureRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 border-b border-border/30 last:border-b-0">
      <div className="text-[11px] text-muted-foreground truncate flex-1 min-w-0 flex items-center gap-1.5">
        <span>{item.shift} Shift</span>
        <span>•</span>
        <span>{item.employmentType}</span>
        <span>•</span>
        {item.source === 'open-reqs' ? (
          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
            Open Req
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-50 text-amber-700 border-amber-200">
            Employed
          </Badge>
        )}
      </div>
      <span className="text-[11px] font-medium tabular-nums text-red-600 ml-2 flex-shrink-0">
        {item.fte.toFixed(1)}
      </span>
    </div>
  );
}
