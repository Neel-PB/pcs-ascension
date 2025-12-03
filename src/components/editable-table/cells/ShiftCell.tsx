import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface ShiftCellProps {
  value: string | null | undefined;
  onClick?: () => void;
}

const SPECIAL_SHIFTS = ['rotating', 'weekend option', 'evening'];

export function ShiftCell({ value, onClick }: ShiftCellProps) {
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [open, setOpen] = useState(false);
  
  const normalizedShift = value?.toLowerCase() || '';
  const isSpecialShift = SPECIAL_SHIFTS.some(s => normalizedShift.includes(s));

  if (!isSpecialShift) {
    // Normal text cell
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
        <span className="truncate">{value || "—"}</span>
      </button>
    );
  }

  // Special shift with pencil icon and popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full h-full text-left px-4 py-2 relative",
            "text-sm font-normal text-foreground",
            "hover:bg-muted/50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          type="button"
        >
          <span className="truncate pr-6">{value || "—"}</span>
          <Pencil
            className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
          />
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
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select shift..." />
              </SelectTrigger>
              <SelectContent>
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
