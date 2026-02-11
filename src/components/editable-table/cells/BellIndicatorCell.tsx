import { Bell } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CellButton } from './CellButton';

interface BellIndicatorCellProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function BellIndicatorCell({
  count,
  onClick,
  className,
}: BellIndicatorCellProps) {
  const handleClick = () => {
    onClick?.();
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CellButton onClick={handleClick} className={className}>
            <div className="relative inline-flex items-center justify-center">
              <Bell
                className={cn(
                  'h-4 w-4 transition-colors',
                  count === 0 ? 'text-muted-foreground/30' : 'text-primary'
                )}
              />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none text-primary-foreground shadow-sm">
                  {displayCount}
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
