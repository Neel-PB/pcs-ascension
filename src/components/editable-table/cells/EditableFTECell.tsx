import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw, CalendarIcon, Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import {
  FTE_STATUS_OPTIONS,
  getMaxExpiryDate,
  getFteValuesForStatus,
  getVisibleStatusOptions,
} from '@/lib/fteStatusRules';

interface EditableFTECellProps {
  value: number | null | undefined;
  originalValue?: number | null | undefined;
  expiryDate?: string | null;
  status?: string | null;
  employmentType?: string | null;
  sharedWith?: string | null;
  sharedFte?: number | null;
  sharedExpiry?: string | null;
  onSave: (data: {
    actual_fte: number | null;
    actual_fte_expiry: string | null;
    actual_fte_status: string | null;
    actual_fte_shared_with?: string | null;
    actual_fte_shared_fte?: number | null;
    actual_fte_shared_expiry?: string | null;
  }) => void | Promise<void>;
  className?: string;
}

export function EditableFTECell({
  value,
  originalValue,
  expiryDate,
  status,
  employmentType,
  sharedWith,
  sharedFte,
  sharedExpiry,
  onSave,
  className,
}: EditableFTECellProps) {
  const [open, setOpen] = useState(false);
  const [editStatus, setEditStatus] = useState(status || '');
  const [editFte, setEditFte] = useState(value?.toString() || '');
  const [editExpiry, setEditExpiry] = useState<Date | undefined>(
    expiryDate ? parseISO(expiryDate) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Shared position fields
  const [editSharedWith, setEditSharedWith] = useState(sharedWith || '');
  const [editSharedFte, setEditSharedFte] = useState(sharedFte?.toString() || '');
  const [editSharedExpiry, setEditSharedExpiry] = useState<Date | undefined>(
    sharedExpiry ? parseISO(sharedExpiry) : undefined
  );
  const [sharedCalendarOpen, setSharedCalendarOpen] = useState(false);

  const isModified = originalValue !== undefined && value !== originalValue;
  const isSharedPosition = editStatus === 'SHARED_POSITION';

  // Get visible status options based on employment type
  const visibleStatusOptions = useMemo(
    () => getVisibleStatusOptions(employmentType),
    [employmentType]
  );

  // Get allowed FTE values based on selected status
  const allowedFteValues = useMemo(
    () => getFteValuesForStatus(editStatus, originalValue),
    [editStatus, originalValue]
  );

  // Get max expiry date for selected status
  const maxExpiryDate = useMemo(
    () => getMaxExpiryDate(editStatus),
    [editStatus]
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset form values when opening
      setEditStatus(status || '');
      setEditFte(value?.toString() || '');
      setEditExpiry(expiryDate ? parseISO(expiryDate) : undefined);
      setEditSharedWith(sharedWith || '');
      setEditSharedFte(sharedFte?.toString() || '');
      setEditSharedExpiry(sharedExpiry ? parseISO(sharedExpiry) : undefined);
    }
    setOpen(newOpen);
  };

  const handleStatusChange = (newStatus: string) => {
    setEditStatus(newStatus);
    // Reset FTE and expiry when status changes
    setEditFte('');
    setEditExpiry(undefined);
    // Reset shared fields if not shared position
    if (newStatus !== 'SHARED_POSITION') {
      setEditSharedWith('');
      setEditSharedFte('');
      setEditSharedExpiry(undefined);
    }
  };

  const handleSave = async () => {
    const numValue = editFte === '' ? null : parseFloat(editFte);
    const expiryValue = editExpiry ? format(editExpiry, 'yyyy-MM-dd') : null;
    const statusValue = editStatus || null;

    const saveData: Parameters<typeof onSave>[0] = {
      actual_fte: numValue,
      actual_fte_expiry: expiryValue,
      actual_fte_status: statusValue,
    };

    // Include shared position fields only if status is Shared Position
    if (isSharedPosition) {
      saveData.actual_fte_shared_with = editSharedWith.trim() || null;
      saveData.actual_fte_shared_fte = editSharedFte ? parseFloat(editSharedFte) : null;
      saveData.actual_fte_shared_expiry = editSharedExpiry
        ? format(editSharedExpiry, 'yyyy-MM-dd')
        : null;
    } else {
      // Clear shared fields if not shared position
      saveData.actual_fte_shared_with = null;
      saveData.actual_fte_shared_fte = null;
      saveData.actual_fte_shared_expiry = null;
    }

    await onSave(saveData);
    setOpen(false);
  };

  const handleRevert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onSave({
      actual_fte: originalValue ?? null,
      actual_fte_expiry: null,
      actual_fte_status: null,
      actual_fte_shared_with: null,
      actual_fte_shared_fte: null,
      actual_fte_shared_expiry: null,
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setEditExpiry(date);
    setCalendarOpen(false);
  };

  const handleSharedDateSelect = (date: Date | undefined) => {
    setEditSharedExpiry(date);
    setSharedCalendarOpen(false);
  };

  const handleClearExpiry = () => {
    setEditExpiry(undefined);
  };

  const handleClearSharedExpiry = () => {
    setEditSharedExpiry(undefined);
  };

  // Check if date should be disabled for main expiry
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    if (maxExpiryDate && date > maxExpiryDate) return true;
    return false;
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
      <PopoverContent 
        className="w-80 p-0 z-50" 
        align="center"
        side="top"
        sideOffset={8}
        collisionPadding={20}
        avoidCollisions={true}
      >
        <div
          className="max-h-[70vh] overflow-y-auto"
          style={{
            maxHeight: 'calc(var(--radix-popper-available-height, 70vh) - 20px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="p-4 space-y-4">
          {/* Status / Reason Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status / Reason</Label>
            <Select value={editStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {visibleStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active FTE Dropdown - shown after status selected */}
          {editStatus && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active FTE</Label>
              <Select value={editFte} onValueChange={setEditFte}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select FTE..." />
                </SelectTrigger>
                <SelectContent>
                  {allowedFteValues.map((v) => (
                    <SelectItem key={v} value={v.toString()}>
                      {v.toFixed(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Expiry Date - shown for non-shared position statuses */}
          {editStatus && !isSharedPosition && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Expiry Date
                {maxExpiryDate && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (max: {format(maxExpiryDate, 'MMM d, yyyy')})
                  </span>
                )}
              </Label>
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
                <PopoverContent className="w-auto p-0 z-[60]" align="start">
                  <Calendar
                    mode="single"
                    selected={editExpiry}
                    onSelect={handleDateSelect}
                    disabled={isDateDisabled}
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
          )}

          {/* Shared Position Additional Fields */}
          {isSharedPosition && (
            <>
              <Separator className="my-3" />
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground font-medium">
                  Shared Position Details
                </p>

                {/* Shared With */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Shared With</Label>
                  <Input
                    value={editSharedWith}
                    onChange={(e) => setEditSharedWith(e.target.value)}
                    placeholder="e.g., ICU - Building A"
                    className="h-9"
                  />
                </div>

                {/* Shared FTE */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Shared FTE</Label>
                  <Select value={editSharedFte} onValueChange={setEditSharedFte}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select FTE..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedFteValues.map((v) => (
                        <SelectItem key={v} value={v.toString()}>
                          {v.toFixed(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Shared Expiry Date - no max limit */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Shared Expiry Date</Label>
                  <Popover open={sharedCalendarOpen} onOpenChange={setSharedCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-9",
                          !editSharedExpiry && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editSharedExpiry ? format(editSharedExpiry, 'MMM d, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[60]" align="start">
                      <Calendar
                        mode="single"
                        selected={editSharedExpiry}
                        onSelect={handleSharedDateSelect}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {editSharedExpiry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground"
                      onClick={handleClearSharedExpiry}
                    >
                      Clear expiry
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

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
              disabled={!editStatus}
            >
              Save
            </Button>
          </div>
        </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
