import { LucideIcon } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BadgeWithValueProps {
  badge: {
    icon: LucideIcon;
    label: string;
    className: string;
    tooltip: string;
  };
  value: {
    display: string | number;
    className?: string;
    tooltip?: string;
  };
}

export function BadgeWithValue({ badge, value }: BadgeWithValueProps) {
  const BadgeIcon = badge.icon;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 w-full">
      {/* Left side - Badge */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={cn("flex items-center gap-1 shrink-0", badge.className)}>
            <BadgeIcon className="h-3 w-3" />
            <span className="text-xs font-medium">{badge.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{badge.tooltip}</p>
        </TooltipContent>
      </Tooltip>

      {/* Right side - Value */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("text-sm font-medium text-right", value.className)}>
            {value.display}
          </div>
        </TooltipTrigger>
        {value.tooltip && (
          <TooltipContent>
            <p>{value.tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
}
