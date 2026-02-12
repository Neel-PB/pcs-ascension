import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  const [pendingDate, setPendingDate] = useState<Date | undefined>(date);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const parsed = value ? (typeof value === 'string' ? new Date(value) : value) : undefined;
    setDate(parsed);
  }, [value]);

  // Sync pendingDate when popover opens
  useEffect(() => {
    if (isOpen) {
      setPendingDate(date);
    }
  }, [isOpen, date]);

  // Auto-open the calendar when triggered
  useEffect(() => {
    if (autoOpen && !isOpen) {
      setIsOpen(true);
      onAutoOpenComplete?.();
    }
  }, [autoOpen, isOpen, onAutoOpenComplete]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setPendingDate(selectedDate);
    }
  };

  const handleConfirm = async () => {
    if (pendingDate) {
      setDate(pendingDate);
      setIsOpen(false);
      const formattedDate = format(pendingDate, 'yyyy-MM-dd');
      await onSave(formattedDate);
    }
  };

  const handleCancel = () => {
    setPendingDate(date);
    setIsOpen(false);
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
        {hasChanged() && originalValue ? (
          <RotateCcw
            className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleRevert(e);
            }}
          />
        ) : (
          <PopoverTrigger asChild>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
          </PopoverTrigger>
        )}
      </div>
      <PopoverContent className="w-auto p-0 shadow-md" align="start">
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-4 py-6">
            <p className="text-xs text-muted-foreground">Select a date</p>
            <p className="text-sm font-medium text-foreground mt-1">
              {pendingDate ? format(pendingDate, formatString) : '—'}
            </p>
          </div>

          {/* Calendar */}
          <Calendar
            mode="single"
            selected={pendingDate}
            onSelect={handleSelect}
            disabled={(d) => {
              if (d < minDate) return true;
              if (maxDate && d > maxDate) return true;
              return false;
            }}
            initialFocus
            className={cn("pointer-events-auto")}
          />

          {/* Separator + Footer */}
          <Separator />
          <div className="flex justify-end gap-6 py-2 px-3">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              CANCEL
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={!pendingDate}>
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
