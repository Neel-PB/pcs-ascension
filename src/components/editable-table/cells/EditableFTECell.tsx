import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw, CalendarIcon, Pencil, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useFilterData } from '@/hooks/useFilterData';
import {
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

  // Filter data for cascading selects
  const { markets, getFacilitiesByMarket, getDepartmentsByFacility } = useFilterData();

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
  };

  const handleFacilityChange = (facilityId: string) => {
    setSharedFacility(facilityId);
    setSharedDepartment('');
  };

  const handleClearDepartment = () => {
    setSharedMarket('');
    setSharedFacility('');
    setSharedDepartment('');
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
            "w-full h-full text-center px-4 py-2",
            "text-sm font-medium",
            "hover:bg-muted/50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "relative group",
            isModified && "text-destructive",
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
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        avoidCollisions={true}
        sticky="partial"
      >
        <div className="p-3">
          <div className="space-y-0">
            {/* Status / Reason Dropdown */}
            <div className="space-y-1.5">
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

            {/* Active FTE Dropdown - shown after status selected */}
            <AnimatePresence mode="wait">
              {editStatus && (
                <motion.div
                  key="fte-field"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <Label className="text-xs font-medium">Active FTE</Label>
                  <Select value={editFte} onValueChange={setEditFte}>
                    <SelectTrigger className="h-7 text-xs">
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expiry Date - shown for non-shared position statuses */}
            <AnimatePresence mode="wait">
              {editStatus && !isSharedPosition && (
                <motion.div
                  key="expiry-field"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <Label className="text-xs font-medium">
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
                          "w-full justify-start text-left font-normal h-7 text-xs",
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shared Position fields with cascading selects */}
            <AnimatePresence mode="wait">
              {isSharedPosition && (
                <motion.div
                  key="shared-fields"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-3 overflow-hidden"
                >
                  {/* Share With - Cascading Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Share With</Label>
                    
                    {/* Show badge if department already selected */}
                    <AnimatePresence mode="wait">
                      {sharedDepartment && !sharedMarket ? (
                        <motion.div
                          key="selected-badge"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="flex items-center gap-2"
                        >
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
                            onClick={() => setSharedMarket('')}
                          >
                            Change
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="cascading-selects"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="space-y-2"
                        >
                          {/* Market Selection */}
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

                          {/* Facility Selection - animates in after market */}
                          <AnimatePresence mode="wait">
                            {sharedMarket && (
                              <motion.div
                                key="facility-select"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="overflow-hidden"
                              >
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
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Department Selection - animates in after facility */}
                          <AnimatePresence mode="wait">
                            {sharedFacility && (
                              <motion.div
                                key="department-select"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="overflow-hidden"
                              >
                                <Select value={sharedDepartment} onValueChange={setSharedDepartment}>
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
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Shared FTE */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Shared FTE</Label>
                    <Select value={editSharedFte} onValueChange={setEditSharedFte}>
                      <SelectTrigger className="h-7 text-xs">
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

                  {/* Shared Expiry Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Shared Expiry Date</Label>
                    <Popover open={sharedCalendarOpen} onOpenChange={setSharedCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-7 text-xs",
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <motion.div 
              className="flex gap-2 pt-3"
              layout
            >
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
            </motion.div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
