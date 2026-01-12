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
  maxLength = 30, 
  placeholder = "—", 
  className, 
  onClick 
}: TruncatedTextCellProps) {
  const displayValue = value || placeholder;
  const isTruncated = value && value.length > maxLength;
  const truncatedText = isTruncated ? `${value.slice(0, maxLength)}...` : displayValue;

  if (!isTruncated) {
    return (
      <CellButton onClick={onClick} className={className}>
        <span className="truncate">{displayValue}</span>
      </CellButton>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <CellButton onClick={onClick} className={className}>
            <span className="truncate">{truncatedText}</span>
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
