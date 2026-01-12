import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type CellButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export const CellButton = forwardRef<HTMLButtonElement, CellButtonProps>(
  ({ children, className, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "w-full h-full text-left px-4 py-2",
          "text-sm font-normal text-foreground",
          "truncate",
          "hover:bg-muted/50 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

CellButton.displayName = 'CellButton';

