import { CellButton } from './CellButton';
import { cn } from '@/lib/utils';

interface TextCellProps {
  value: string | null | undefined;
  placeholder?: string;
  className?: string;
  onClick?: () => void;
}

export function TextCell({ value, placeholder = "—", className, onClick }: TextCellProps) {
  return (
    <CellButton onClick={onClick} className={className}>
      <span className="truncate">{value || placeholder}</span>
    </CellButton>
  );
}
