import { MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CellButton } from './CellButton';

interface CommentIndicatorCellProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function CommentIndicatorCell({
  count,
  onClick,
  className,
}: CommentIndicatorCellProps) {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CellButton onClick={handleClick} className={className}>
            <Badge 
              variant={count > 0 ? "default" : "outline"}
              className={cn(
                "font-medium tabular-nums",
                count === 0 && "text-muted-foreground"
              )}
            >
              {count === 0 ? '-' : count > 99 ? '99+' : count}
            </Badge>
          </CellButton>
        </TooltipTrigger>
        <TooltipContent>
          {count === 0 ? 'No Comments Yet' : `View Comments (${count})`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
