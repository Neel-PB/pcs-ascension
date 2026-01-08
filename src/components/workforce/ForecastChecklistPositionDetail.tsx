import { Badge } from '@/components/ui/badge';
import { PositionDetail } from '@/hooks/useForecastChecklist';

interface ForecastChecklistPositionDetailProps {
  detail: PositionDetail;
  type: 'shortage' | 'surplus';
}

// Map employment type to display label
function getEmploymentLabel(employmentType: string): string {
  switch (employmentType) {
    case 'Full-Time': return 'Full-Time';
    case 'Part-Time': return 'Part-Time';
    case 'PRN': return 'PRN';
    default: return employmentType;
  }
}

export function ForecastChecklistPositionDetail({ detail, type }: ForecastChecklistPositionDetailProps) {
  const fteColor = type === 'shortage' ? 'text-emerald-600' : 'text-red-600';
  const showCountBadge = detail.count > 1;
  const totalFTE = detail.fte * detail.count;

  return (
    <div className="flex items-center justify-between py-1.5 px-2 border-b border-border/20 last:border-b-0 hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="text-[11px] text-muted-foreground">
          {detail.shift} Shift • {getEmploymentLabel(detail.employmentType)}
        </span>
        {type === 'surplus' && detail.source && (
          <Badge 
            variant="outline" 
            className={`text-[9px] px-1 py-0 ${
              detail.source === 'open-reqs' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {detail.source === 'open-reqs' ? 'Req' : 'Emp'}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        {showCountBadge && (
          <Badge variant="secondary" className="text-[9px] px-1 py-0 min-w-[16px] text-center">
            {detail.count}
          </Badge>
        )}
        <span className={`text-[11px] font-medium tabular-nums ${fteColor}`}>
          {totalFTE.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
