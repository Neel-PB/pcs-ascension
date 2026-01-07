import { ChecklistPositionToClose } from '@/hooks/useForecastChecklist';

interface ForecastChecklistClosureRowProps {
  item: ChecklistPositionToClose;
}

export function ForecastChecklistClosureRow({ item }: ForecastChecklistClosureRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 border-b border-border/30 last:border-b-0">
      <div className="text-[11px] text-muted-foreground truncate flex-1 min-w-0">
        <span>{item.facilityName}</span>
        <span className="mx-1">•</span>
        <span>{item.departmentName}</span>
        <span className="mx-1">•</span>
        <span>{item.shift} Shift</span>
      </div>
      <span className="text-[11px] font-medium tabular-nums text-red-600 ml-2 flex-shrink-0">
        {item.fte.toFixed(1)}
      </span>
    </div>
  );
}
