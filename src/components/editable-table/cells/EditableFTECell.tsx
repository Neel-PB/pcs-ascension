import { useState, useMemo, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw, CalendarIcon, Pencil, X, Info } from '@/lib/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { format, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import type { Market, Facility, Department } from '@/hooks/useFilterData';
import {
  getMaxExpiryDate,
  getFteValuesForStatus,
  getVisibleStatusOptions,
} from '@/lib/fteStatusRules';

// Lazy load Calendar for performance - only imported when popover opens
const Calendar = lazy(() => import('@/components/ui/calendar').then(m => ({ default: m.Calendar })));

// Filter data provider type for prop drilling
export interface FilterDataProvider {
  markets: Market[];
  getFacilitiesByMarket: (market: string) => Facility[];
  getDepartmentsByFacility: (facilityId: string) => Department[];
}

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
    comment?: string;
  }) => void | Promise<void>;
  className?: string;
  // Performance optimization: pass filter data from parent instead of calling hook per cell
  filterDataProvider?: FilterDataProvider;
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
  filterDataProvider,
}: EditableFTECellProps) {
  const [open, setOpen] = useState(false);
  const [editStatus, setEditStatus] = useState(status || '');
  const [editFte, setEditFte] = useState(value?.toString() || '');
  const [editExpiry, setEditExpiry] = useState<Date | undefined>(
    expiryDate ? parseISO(expiryDate) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Shared position cascading selection state
  const [sharedMarket, setSharedMarket] = useState('');
  const [sharedFacility, setSharedFacility] = useState('');
  const [sharedDepartment, setSharedDepartment] = useState(sharedWith || '');
  
  // Shared position other fields
  const [editSharedFte, setEditSharedFte] = useState(sharedFte?.toString() || '');
  const [editSharedExpiry, setEditSharedExpiry] = useState<Date | undefined>(
    sharedExpiry ? parseISO(sharedExpiry) : undefined
  );
  const [sharedCalendarOpen, setSharedCalendarOpen] = useState(false);
  
  // Comment field for FTE changes
  const [comment, setComment] = useState('');
  
  // Editing state for share selection - when false, show badge; when true, show cascading selects
  const [isEditingShare, setIsEditingShare] = useState(false);

  // Use filter data from provider (passed from parent) - no hook call per cell
  const markets = filterDataProvider?.markets ?? [];
  const getFacilitiesByMarket = filterDataProvider?.getFacilitiesByMarket ?? (() => []);
  const getDepartmentsByFacility = filterDataProvider?.getDepartmentsByFacility ?? (() => []);

  const isModified = originalValue !== undefined && value !== originalValue;
  const isSharedPosition = editStatus === 'SHARED_POSITION';

  // Compute cascading options
  const sharedFacilities = useMemo(
    () => sharedMarket ? getFacilitiesByMarket(sharedMarket) : [],
    [sharedMarket, getFacilitiesByMarket]
  );

  const sharedDepartments = useMemo(
    () => sharedFacility ? getDepartmentsByFacility(sharedFacility) : [],
    [sharedFacility, getDepartmentsByFacility]
  );

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
      setSharedMarket('');
      setSharedFacility('');
      setSharedDepartment(sharedWith || '');
      setEditSharedFte(sharedFte?.toString() || '');
      setEditSharedExpiry(sharedExpiry ? parseISO(sharedExpiry) : undefined);
      setIsEditingShare(false); // Reset editing state when opening
      setComment(''); // Reset comment when opening
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
      setSharedMarket('');
      setSharedFacility('');
      setSharedDepartment('');
      setEditSharedFte('');
      setEditSharedExpiry(undefined);
    }
  };

  const handleMarketChange = (market: string) => {
    setSharedMarket(market);
    setSharedFacility('');
    setSharedDepartment('');
    setIsEditingShare(true);
  };

  const handleFacilityChange = (facilityId: string) => {
    setSharedFacility(facilityId);
    setSharedDepartment('');
  };

  const handleClearDepartment = () => {
    setSharedMarket('');
    setSharedFacility('');
    setSharedDepartment('');
    setIsEditingShare(false);
  };

  const handleSave = async () => {
    const numValue = editFte === '' ? null : parseFloat(editFte);
    const expiryValue = editExpiry ? format(editExpiry, 'yyyy-MM-dd') : null;
    const statusValue = editStatus || null;

    const saveData: Parameters<typeof onSave>[0] = {
      actual_fte: numValue,
      actual_fte_expiry: expiryValue,
      actual_fte_status: statusValue,
      comment: comment.trim() || undefined,
    };

    // Include shared position fields only if status is Shared Position
    if (isSharedPosition) {
      saveData.actual_fte_shared_with = sharedDepartment.trim() || null;
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
            "w-full h-full text-left px-4 py-2",
            "text-sm font-medium",
            "hover:bg-muted/50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "flex items-center gap-2",
            isModified && "text-primary",
            className
          )}
          type="button"
        >
          <span className="flex-1">{value != null ? value : '—'}</span>
          {isModified ? (
            <RotateCcw
              className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              onClick={handleRevert}
            />
          ) : (
            <Pencil
              className="h-3.5 w-3.5 text-muted-foreground shrink-0"
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn("p-0 z-50", isSharedPosition ? "w-[440px]" : "w-80")}
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        avoidCollisions={true}
      >
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-col">
            <div className={cn("space-y-3 p-3", isSharedPosition && "p-2 space-y-1.5")}>
              {/* Section 1: Status / Reason */}
              <div className="space-y-0.5">
                <Label className="text-xs font-medium">Status / Reason</Label>
                <Select value={editStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-7 text-xs">
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

              {/* Section 2+: Dynamic content - single AnimatePresence */}
              <AnimatePresence mode="wait">
                {editStatus && !isSharedPosition && (
                  <motion.div
                    key="standard-layout"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    {/* FTE + Expiry inline grid */}
                    <div className="grid grid-cols-2 gap-2 items-end">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Active FTE</Label>
                        <Select value={editFte} onValueChange={setEditFte}>
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="FTE..." />
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

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs font-medium">Expiry</Label>
                          {maxExpiryDate && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                Max: {format(maxExpiryDate, 'MMM d, yyyy')}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "flex-1 justify-start text-left font-normal h-7 text-xs px-2",
                                  !editExpiry && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                                {editExpiry ? format(editExpiry, 'MMM d') : 'Date...'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[60] shadow-md" align="start">
                              <Suspense fallback={<div className="p-3 text-xs text-muted-foreground">Loading...</div>}>
                                <Calendar
                                  mode="single"
                                  selected={editExpiry}
                                  onSelect={handleDateSelect}
                                  disabled={isDateDisabled}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </Suspense>
                            </PopoverContent>
                          </Popover>
                          {editExpiry && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={handleClearExpiry}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        Comment <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a note about this change..."
                        className="min-h-[52px] text-xs resize-none"
                        maxLength={500}
                      />
                    </div>
                  </motion.div>
                )}

                {editStatus && isSharedPosition && (
                  <motion.div
                    key="shared-layout"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-1.5"
                  >
                    {/* Two-column grid */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {/* Left column: Active FTE + Expiry */}
                      <div className="space-y-1">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-medium">Active FTE</Label>
                          <Select value={editFte} onValueChange={setEditFte}>
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="FTE..." />
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

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Label className="text-xs font-medium">Expiry</Label>
                            {maxExpiryDate && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Max: {format(maxExpiryDate, 'MMM d, yyyy')}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex-1 justify-start text-left font-normal h-7 text-xs px-2",
                                    !editExpiry && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                                  {editExpiry ? format(editExpiry, 'MMM d') : 'Date...'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-[60] shadow-md" align="start">
                                <Suspense fallback={<div className="p-3 text-xs text-muted-foreground">Loading...</div>}>
                                  <Calendar
                                    mode="single"
                                    selected={editExpiry}
                                    onSelect={handleDateSelect}
                                    disabled={isDateDisabled}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </Suspense>
                              </PopoverContent>
                            </Popover>
                            {editExpiry && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={handleClearExpiry}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right column: Share With + Shared FTE + Shared Expiry */}
                      <div className="space-y-1 border-l border-border/40 pl-1.5">
                        {/* Share With */}
                        <div className="space-y-0.5">
                          <Label className="text-xs font-medium">Share With</Label>
                          {sharedDepartment && !isEditingShare ? (
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="secondary"
                                className="text-xs py-1 px-2 flex items-center gap-1"
                              >
                                {sharedDepartment}
                                <button
                                  type="button"
                                  onClick={handleClearDepartment}
                                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => setIsEditingShare(true)}
                              >
                                Change
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <Select value={sharedMarket} onValueChange={handleMarketChange}>
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue placeholder="Select market..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {markets.map((m) => (
                                    <SelectItem key={m.id} value={m.market}>
                                      {m.market}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {sharedMarket && (
                                <Select value={sharedFacility} onValueChange={handleFacilityChange}>
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder="Select facility..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sharedFacilities.map((f) => (
                                      <SelectItem key={f.id} value={f.facility_id}>
                                        {f.facility_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {sharedFacility && (
                                <Select value={sharedDepartment} onValueChange={(value) => {
                                  setSharedDepartment(value);
                                  setIsEditingShare(false);
                                }}>
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder="Select department..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sharedDepartments.map((d) => (
                                      <SelectItem key={d.id} value={d.department_name}>
                                        {d.department_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Shared FTE */}
                        <div className="space-y-0.5">
                          <Label className="text-xs font-medium">Shared FTE</Label>
                          <Select value={editSharedFte} onValueChange={setEditSharedFte}>
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="FTE..." />
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

                        {/* Shared Expiry */}
                        <div className="space-y-0.5">
                          <Label className="text-xs font-medium">Shared Expiry</Label>
                          <div className="flex items-center gap-1">
                            <Popover open={sharedCalendarOpen} onOpenChange={setSharedCalendarOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex-1 justify-start text-left font-normal h-7 text-xs px-2",
                                    !editSharedExpiry && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                                  {editSharedExpiry ? format(editSharedExpiry, 'MMM d') : 'Date...'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-[60] shadow-md" align="start">
                                <Suspense fallback={<div className="p-3 text-xs text-muted-foreground">Loading...</div>}>
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
                                    className="pointer-events-auto"
                                  />
                                </Suspense>
                              </PopoverContent>
                            </Popover>
                            {editSharedExpiry && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={handleClearSharedExpiry}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comment - full width below */}
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">
                        Comment <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a note about this change..."
                        className="min-h-[36px] text-xs resize-none"
                        maxLength={500}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions - sticky footer */}
            <div className="flex gap-2 p-2 pt-2 border-t bg-popover sticky bottom-0">
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
        </TooltipProvider>
      </PopoverContent>
    </Popover>
  );
}
