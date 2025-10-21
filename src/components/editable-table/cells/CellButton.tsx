import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CellButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CellButton({ children, onClick, className }: CellButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-full text-left px-4 py-2",
        "text-sm font-normal text-foreground",
        "truncate",
        "hover:bg-muted/50 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      type="button"
    >
      {children}
    </button>
  );
}
