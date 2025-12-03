import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw, CalendarIcon, Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';

interface EditableFTECellProps {
  value: number | null | undefined;
  originalValue?: number | null | undefined;
  expiryDate?: string | null;
  status?: string | null;
  onSave: (data: {
    actual_fte: number | null;
    actual_fte_expiry: string | null;
    actual_fte_status: string | null;
  }) => void | Promise<void>;
  className?: string;
}

export function EditableFTECell({
  value,
  originalValue,
  expiryDate,
  status,
  onSave,
  className,
}: EditableFTECellProps) {
  const [open, setOpen] = useState(false);
  const [editFte, setEditFte] = useState(value?.toString() || '');
  const [editExpiry, setEditExpiry] = useState<Date | undefined>(
    expiryDate ? parseISO(expiryDate) : undefined
  );
  const [editStatus, setEditStatus] = useState(status || '');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isModified = originalValue !== undefined && value !== originalValue;

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset form values when opening
      setEditFte(value?.toString() || '');
      setEditExpiry(expiryDate ? parseISO(expiryDate) : undefined);
      setEditStatus(status || '');
    }
    setOpen(newOpen);
  };

  const handleSave = async () => {
    const numValue = editFte === '' ? null : parseFloat(editFte);
    const expiryValue = editExpiry ? format(editExpiry, 'yyyy-MM-dd') : null;
    const statusValue = editStatus.trim() || null;

    await onSave({
      actual_fte: numValue,
      actual_fte_expiry: expiryValue,
      actual_fte_status: statusValue,
    });
    setOpen(false);
  };

  const handleRevert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onSave({
      actual_fte: originalValue ?? null,
      actual_fte_expiry: null,
      actual_fte_status: null,
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setEditExpiry(date);
    setCalendarOpen(false);
  };

  const handleClearExpiry = () => {
    setEditExpiry(undefined);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full h-full text-center px-4 py-2",
            "text-sm font-medium",
            "hover:bg-muted/50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "relative group",
            isModified && "text-red-600 dark:text-red-400",
            className
          )}
          type="button"
        >
          <span className="block">{value != null ? value : '—'}</span>
          {isModified ? (
            <RotateCcw
              className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={handleRevert}
            />
          ) : (
            <Pencil
              className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="center">
        <div className="space-y-4">
          {/* FTE Input */}
          <div className="space-y-2">
            <Label htmlFor="fte-input" className="text-sm font-medium">
              Active FTE
            </Label>
            <Input
              id="fte-input"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={editFte}
              onChange={(e) => setEditFte(e.target.value)}
              className="h-9"
              placeholder="0.00"
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Expiry Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !editExpiry && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editExpiry ? format(editExpiry, 'MMM d, yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editExpiry}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {editExpiry && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={handleClearExpiry}
              >
                Clear expiry
              </Button>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status-input" className="text-sm font-medium">
              Status / Reason
            </Label>
            <Textarea
              id="status-input"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              placeholder="e.g., FMLA leave, temporary reduction"
              className="min-h-[60px] resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {isModified && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleRevert}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Revert
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
