import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { PositionDetail } from '@/hooks/useForecastChecklist';

interface ForecastChecklistPositionDetailProps {
  detail: PositionDetail;
  type: 'shortage' | 'surplus';
  isSelected?: boolean;
  onToggleSelection?: (detailId: string) => void;
  showSelection?: boolean;
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

export function ForecastChecklistPositionDetail({ 
  detail, 
  type,
  isSelected = false,
  onToggleSelection,
  showSelection = false,
}: ForecastChecklistPositionDetailProps) {
  const fteColor = type === 'shortage' ? 'text-emerald-600' : 'text-red-600';
  const showCountBadge = detail.count > 1;
  const isEmployed = detail.source === 'employed';
  const isSurplus = type === 'surplus';
  const showCheckbox = showSelection && isSurplus;

  const handleCheckboxChange = () => {
    if (onToggleSelection) {
      onToggleSelection(detail.id);
    }
  };

  return (
    <div className="flex items-center justify-between py-1.5 px-2 border-b border-border/20 last:border-b-0 hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {showCheckbox && (
          <div className="flex items-center">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              className="h-3.5 w-3.5"
            />
          </div>
        )}
        <span className="text-[11px] text-muted-foreground">
          {getEmploymentLabel(detail.employmentType)}
        </span>
        {isSurplus && detail.source && (
          <Badge 
            variant="outline" 
            className={`text-[9px] px-1.5 py-0 rounded-full ${
              detail.source === 'open-reqs' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {detail.source === 'open-reqs' ? 'Req' : 'Emp'}
          </Badge>
        )}
        {isEmployed && showCheckbox && (
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[200px]">
              Closing employed positions requires HR approval and is operationally complex
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        {showCountBadge && (
          <Badge variant="secondary" className="text-[9px] px-1 py-0 min-w-[16px] text-center">
            {detail.count}
          </Badge>
        )}
        <span className={`text-[11px] font-medium tabular-nums ${fteColor}`}>
          {detail.fte.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
