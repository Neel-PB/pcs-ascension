import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipArrow } from '@/components/ui/tooltip';
import { CellButton } from './CellButton';

interface TextCellProps {
  value: string | null | undefined;
  placeholder?: string;
  className?: string;
  onClick?: () => void;
}

export function TextCell({ value, placeholder = "—", className, onClick }: TextCellProps) {
  // If no value, just show placeholder without tooltip
  if (!value) {
    return (
      <CellButton onClick={onClick} className={className}>
        <span className="truncate">{placeholder}</span>
      </CellButton>
    );
  }

  // Always show tooltip for values (CSS truncate handles visual cut-off)
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <CellButton onClick={onClick} className={className}>
            <span className="truncate">{value}</span>
          </CellButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {value}
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
