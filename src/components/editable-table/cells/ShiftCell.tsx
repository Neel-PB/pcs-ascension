import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { CellButton } from './CellButton';

interface ShiftCellProps {
  value: string | null | undefined;
  onClick?: () => void;
}

const SPECIAL_SHIFTS = ['rotating', 'weekend option', 'evening'];

export function ShiftCell({ value, onClick }: ShiftCellProps) {
  const [selectedShift, setSelectedShift] = useState<string>("");
  
  const normalizedShift = value?.toLowerCase() || '';
  const isSpecialShift = SPECIAL_SHIFTS.some(s => normalizedShift.includes(s));

  if (!isSpecialShift) {
    // Normal text cell
    return (
      <CellButton onClick={onClick}>
        <span className="truncate">{value || "—"}</span>
      </CellButton>
    );
  }

  // Two-row layout for special shifts
  return (
    <div className="w-full h-full px-3 flex flex-col justify-center gap-0.5">
      {/* Top: Original shift */}
      <div className="text-xs text-muted-foreground truncate leading-tight">
        {value}
      </div>
      
      {/* Bottom: Day/Night dropdown */}
      <Select value={selectedShift} onValueChange={setSelectedShift}>
        <SelectTrigger className="h-6 text-xs border-0 bg-transparent px-0 py-0 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
          <SelectValue placeholder="Select shift..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Day</SelectItem>
          <SelectItem value="night">Night</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
