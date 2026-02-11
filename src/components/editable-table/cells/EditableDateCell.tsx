import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Pencil, RotateCcw } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface EditableDateCellProps {
  value: string | Date | null | undefined;
  originalValue?: string | Date | null | undefined;
  onSave: (value: string | null) => void | Promise<void>;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  formatString?: string;
  autoOpen?: boolean;
  onAutoOpenComplete?: () => void;
}

export function EditableDateCell({
  value,
  originalValue,
  onSave,
  className,
  minDate = new Date(),
  maxDate,
  formatString = 'MMM d, yyyy',
  autoOpen = false,
  onAutoOpenComplete,
}: EditableDateCellProps) {
  const [date, setDate] = useState<Date | undefined>(
    value ? (typeof value === 'string' ? new Date(value) : value) : undefined
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setDate(value ? (typeof value === 'string' ? new Date(value) : value) : undefined);
  }, [value]);

  // Auto-open the calendar when triggered
  useEffect(() => {
    if (autoOpen && !isOpen) {
      setIsOpen(true);
      onAutoOpenComplete?.();
    }
  }, [autoOpen, isOpen, onAutoOpenComplete]);

  const handleSelect = async (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setIsOpen(false);
      
      // Format as YYYY-MM-DD for database
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      await onSave(formattedDate);
    }
  };

  const handleRevert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (originalValue) {
      const origDate = typeof originalValue === 'string' ? new Date(originalValue) : originalValue;
      setDate(origDate);
      const formattedDate = format(origDate, 'yyyy-MM-dd');
      await onSave(formattedDate);
    } else {
      setDate(undefined);
      await onSave(null);
    }
  };

  const hasChanged = () => {
    if (!value && !originalValue) return false;
    if (!value || !originalValue) return true;
    
    const currentDate = typeof value === 'string' ? new Date(value) : value;
    const origDate = typeof originalValue === 'string' ? new Date(originalValue) : originalValue;
    
    return currentDate.getTime() !== origDate.getTime();
  };

  const displayValue = date ? format(date, formatString) : '—';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between w-full h-full px-4">
        <span className={cn("text-sm", !date && "text-muted-foreground", className)}>
          {displayValue}
        </span>
        <PopoverTrigger asChild>
          {hasChanged() && originalValue ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleRevert(e);
              }}
              title="Revert to original"
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
      <PopoverContent className="w-auto p-0 shadow-md" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(date) => {
            if (date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          className={cn("pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
