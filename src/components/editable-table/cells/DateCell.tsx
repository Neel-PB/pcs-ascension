import { format } from 'date-fns';
import { CellButton } from './CellButton';
import { cn } from '@/lib/utils';

interface DateCellProps {
  value: string | Date | null | undefined;
  formatString?: string;
  className?: string;
  onClick?: () => void;
}

export function DateCell({ 
  value, 
  formatString = 'MMM d, yyyy', 
  className, 
  onClick 
}: DateCellProps) {
  let displayValue = '—';
  
  if (value) {
    try {
      const date = typeof value === 'string' ? new Date(value) : value;
      displayValue = format(date, formatString);
    } catch (error) {
      displayValue = '—';
    }
  }
  
  return (
    <CellButton onClick={onClick} className={className}>
      <span>{displayValue}</span>
    </CellButton>
  );
}
