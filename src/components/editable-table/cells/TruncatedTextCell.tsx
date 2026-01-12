import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipArrow } from '@/components/ui/tooltip';
import { CellButton } from './CellButton';
import { cn } from '@/lib/utils';

interface TruncatedTextCellProps {
  value: string | null | undefined;
  maxLength?: number;
  placeholder?: string;
  className?: string;
  onClick?: () => void;
}

export function TruncatedTextCell({ 
  value, 
  placeholder = "—", 
  className, 
  onClick 
}: TruncatedTextCellProps) {
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
        <TooltipContent 
          side="top" 
          sideOffset={8} 
          className="max-w-[300px] break-words"
        >
          {value}
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
