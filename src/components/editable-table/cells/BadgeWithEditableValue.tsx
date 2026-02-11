import { LucideIcon, AlertCircle } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EditableNumberCell } from './EditableNumberCell';
import { cn } from '@/lib/utils';

interface BadgeWithEditableValueProps {
  badge: {
    icon: LucideIcon;
    label: string;
    className: string;
    tooltip: string;
  };
  editableValue: {
    value: number | null;
    onSave: (value: number | null) => Promise<void>;
    showWarning?: boolean;
    warningTooltip?: string;
  };
}

export function BadgeWithEditableValue({ badge, editableValue }: BadgeWithEditableValueProps) {
  const BadgeIcon = badge.icon;

  return (
    <div className="relative flex items-center justify-between gap-2 px-3 py-2 w-full">
      {/* Left side - Status Badge */}
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

      {/* Right side - Editable Value */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <div className="min-w-[100px]">
          <EditableNumberCell
            value={editableValue.value}
            originalValue={null}
            onSave={editableValue.onSave}
          />
        </div>

        {/* Warning Icon */}
        {editableValue.showWarning && (
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{editableValue.warningTooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
