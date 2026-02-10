import { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableNumberPopoverCellProps {
  value: number | null | undefined;
  onSave: (value: number | null) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  isPending?: boolean;
  className?: string;
  suffix?: string;
  autoOpen?: boolean;
  onAutoOpenComplete?: () => void;
}

export function EditableNumberPopoverCell({
  value,
  onSave,
  onDelete,
  isPending = false,
  className,
  suffix = '%',
  autoOpen = false,
  onAutoOpenComplete,
}: EditableNumberPopoverCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-open when triggered
  useEffect(() => {
    if (autoOpen && !isOpen) {
      setIsOpen(true);
      onAutoOpenComplete?.();
    }
  }, [autoOpen, isOpen, onAutoOpenComplete]);

  // Sync input value when popover opens
  useEffect(() => {
    if (isOpen) {
      setInputValue(value != null ? String(value) : '');
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [isOpen, value]);

  const handleSubmit = async () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      setIsOpen(false);
      await onSave(parsed);
    }
  };

  const handleRevert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete();
    } else {
      await onSave(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const hasValue = value != null;
  const displayValue = hasValue ? `${value}${suffix}` : '—';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between w-full h-full px-4">
        <span
          className={cn(
            'text-sm',
            !hasValue && !isPending && 'text-muted-foreground',
            isPending && 'text-amber-600 font-medium',
            className
          )}
        >
          {displayValue}
        </span>
        <PopoverTrigger asChild>
          {hasValue ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleRevert(e);
              }}
              title="Revert override"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-48 p-3 pointer-events-auto" align="start">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter value"
            className="h-8 text-sm"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={handleSubmit}
            disabled={inputValue === '' || isNaN(parseFloat(inputValue))}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
