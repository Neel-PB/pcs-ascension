import { MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CellButton onClick={onClick} className={className}>
            <div className="flex items-center gap-1.5">
              <MessageSquareText
                className={cn(
                  'h-4 w-4 transition-colors',
                  count === 0 ? 'text-muted-foreground/30' : 'text-muted-foreground'
                )}
              />
              {count > 0 && (
                <span className="text-xs font-medium tabular-nums">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>
          </CellButton>
        </TooltipTrigger>
        <TooltipContent>
          {count === 0 ? 'No Comments Yet' : `View Comments (${count})`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
