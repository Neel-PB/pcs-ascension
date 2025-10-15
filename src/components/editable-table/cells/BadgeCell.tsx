import { Badge } from '@/components/ui/badge';
import { CellButton } from './CellButton';
import { cn } from '@/lib/utils';

interface BadgeCellProps {
  value: string | null | undefined;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  onClick?: () => void;
}

export function BadgeCell({ 
  value, 
  variant = 'outline', 
  className, 
  onClick 
}: BadgeCellProps) {
  if (!value) {
    return (
      <CellButton onClick={onClick} className={className}>
        <span>—</span>
      </CellButton>
    );
  }
  
  return (
    <CellButton onClick={onClick} className={className}>
      <Badge variant={variant} className="truncate max-w-full">
        {value}
      </Badge>
    </CellButton>
  );
}
