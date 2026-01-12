import { Badge } from '@/components/ui/badge';
import { CellButton } from './CellButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipArrow } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BadgeCellProps {
  value: string | null | undefined;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  maxLength?: number;
  onClick?: () => void;
}

export function BadgeCell({ 
  value, 
  variant = 'outline', 
  className, 
  maxLength = 30,
  onClick 
}: BadgeCellProps) {
  if (!value) {
    return (
      <CellButton onClick={onClick} className={className}>
        <span>—</span>
      </CellButton>
    );
  }

  const isTruncated = value.length > maxLength;
  const displayValue = isTruncated ? `${value.slice(0, maxLength)}...` : value;
  
  const badgeContent = (
    <CellButton onClick={onClick} className={className}>
      <Badge variant={variant} className="truncate max-w-full">
        {displayValue}
      </Badge>
    </CellButton>
  );

  if (!isTruncated) {
    return badgeContent;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
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
