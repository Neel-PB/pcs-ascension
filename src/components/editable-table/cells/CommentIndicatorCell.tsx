import { MessageSquareText } from '@/lib/icons';
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
    <CellButton onClick={handleClick} className={cn("flex items-center justify-center", className)}>
      {count > 0 && (
        <Badge 
          variant="default"
          className="font-medium tabular-nums min-w-[2rem] justify-center text-center"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </CellButton>
  );
}
