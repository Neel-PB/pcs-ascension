import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableDateCellProps {
  value: string | Date | null | undefined;
  originalValue?: string | Date | null | undefined;
  onSave: (value: string | null) => void | Promise<void>;
  className?: string;
  minDate?: Date;
  formatString?: string;
}

export function EditableDateCell({
  value,
  originalValue,
  onSave,
  className,
  minDate = new Date(),
  formatString = 'MMM d, yyyy',
}: EditableDateCellProps) {
  const [date, setDate] = useState<Date | undefined>(
    value ? (typeof value === 'string' ? new Date(value) : value) : undefined
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setDate(value ? (typeof value === 'string' ? new Date(value) : value) : undefined);
  }, [value]);

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
    <div className="flex items-center justify-between w-full h-full px-3 group">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 justify-start text-left font-normal h-full px-0 hover:bg-transparent",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={(date) => date < minDate}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      
      {hasChanged() && originalValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRevert}
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-6 w-6 p-0"
          title="Revert to original"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
