import { ChecklistPositionToOpen } from '@/hooks/useForecastChecklist';

interface ForecastChecklistOpeningRowProps {
  item: ChecklistPositionToOpen;
}

export function ForecastChecklistOpeningRow({ item }: ForecastChecklistOpeningRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 border-b border-border/30 last:border-b-0">
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="text-[11px] text-muted-foreground truncate">
          <span>{item.shift} Shift</span>
          <span className="mx-1">•</span>
          <span>{item.employmentType}</span>
        </div>
        <div className="text-[10px] text-muted-foreground/70 truncate">
          {item.region} › {item.market} › {item.facilityName} › {item.departmentName}
        </div>
      </div>
      <span className="text-[11px] font-medium tabular-nums text-emerald-600 ml-2 flex-shrink-0">
        {item.fte.toFixed(1)}
      </span>
    </div>
  );
}
