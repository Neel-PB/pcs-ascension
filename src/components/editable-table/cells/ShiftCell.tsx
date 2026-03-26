import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipArrow } from "@/components/ui/tooltip";
import { useState } from "react";
import { Pencil, RotateCcw } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface ShiftCellProps {
  value: string | null | undefined;
  selectedDayNight?: string | null;
  onSave?: (selection: string | null) => void;
  onClick?: () => void;
}

const SPECIAL_SHIFTS = ['rotating', 'weekend option', 'evening'];
const UNSET = "unset" as const;

export function ShiftCell({ value, selectedDayNight, onSave, onClick }: ShiftCellProps) {
  const [localSelection, setLocalSelection] = useState<string>(selectedDayNight || UNSET);
  const [open, setOpen] = useState(false);
  
  const normalizedShift = value?.toLowerCase() || '';
  const isSpecialShift = SPECIAL_SHIFTS.some(s => normalizedShift.includes(s));
  const isModified = !!selectedDayNight;

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalSelection(UNSET);
    onSave?.(null);
  };

  const handleSelect = (val: string) => {
    if (val === UNSET) return; // Ignore placeholder selection
    setLocalSelection(val);
    onSave?.(val);
    setOpen(false);
  };

  if (!isSpecialShift) {
    // Normal text cell with tooltip
    if (!value) {
      return (
        <button
          onClick={onClick}
          className={cn(
            "w-full h-full text-left px-4 py-2",
            "text-sm font-normal text-foreground",
            "truncate",
            "hover:bg-muted/50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          type="button"
        >
          <span className="truncate">—</span>
        </button>
      );
    }

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                "w-full h-full text-left px-4 py-2",
                "text-sm font-normal text-foreground",
                "truncate",
                "hover:bg-muted/50 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
              type="button"
            >
              <span className="truncate">{value}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            {value}
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Special shift with pencil/reset icon and popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full h-full text-left px-4 py-2",
            "text-sm font-normal text-foreground",
            "hover:bg-muted/50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "flex items-center gap-2"
          )}
          type="button"
        >
          {isModified ? (
            <span className="flex-1 inline-flex items-center gap-1 whitespace-nowrap min-w-0">
              <span className="text-muted-foreground line-through text-xs truncate max-w-[60px]">{value}</span>
              <span className="text-muted-foreground shrink-0">→</span>
              <span className="font-medium shrink-0">{selectedDayNight ? selectedDayNight.charAt(0).toUpperCase() + selectedDayNight.slice(1) : ''}</span>
            </span>
          ) : (
            <span className="flex-1 truncate whitespace-nowrap min-w-0">{value || "—"}</span>
          )}
          {isModified ? (
            <RotateCcw
              className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              onClick={handleReset}
            />
          ) : (
            <Pencil
              className="h-3.5 w-3.5 text-muted-foreground shrink-0"
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Original Shift</Label>
            <p className="text-sm font-medium">{value}</p>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Day/Night Selection</Label>
            <Select value={localSelection} onValueChange={handleSelect}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select shift..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET} disabled className="text-muted-foreground">
                  Select shift...
                </SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
