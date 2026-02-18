import { CellButton } from './CellButton';
import { cn } from '@/lib/utils';

interface NumberCellProps {
  value: number | string | null | undefined;
  suffix?: string;
  className?: string;
  onClick?: () => void;
}

export function NumberCell({ value, suffix, className, onClick }: NumberCellProps) {
  const displayValue = value != null ? `${value}${suffix || ''}` : '—';
  
  return (
    <CellButton onClick={onClick} className={cn("font-medium", className)}>
      <span>{displayValue}</span>
    </CellButton>
  );
}
