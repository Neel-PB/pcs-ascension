import { X } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export interface PositionsFilterValues {
  skillMix: string;
  staffType: string;
  shift: string;
  fteMin: string;
  fteMax: string;
  status: string;
  employeeType: string;
}

export const DEFAULT_POSITION_FILTERS: PositionsFilterValues = {
  skillMix: "all",
  staffType: "all",
  shift: "all",
  fteMin: "all",
  fteMax: "all",
  status: "all",
  employeeType: "all",
};

const FTE_OPTIONS = Array.from({ length: 10 }, (_, i) => ((i + 1) / 10).toFixed(1));

interface PositionsFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PositionsFilterValues;
  onFiltersChange: (filters: PositionsFilterValues) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  showStatus?: boolean;
  skillMixOptions: string[];
  employeeTypeOptions: string[];
  title?: string;
}

export function getActiveFilterCount(filters: PositionsFilterValues, showStatus: boolean): number {
  let count = 0;
  if (filters.skillMix !== "all") count++;
  if (filters.staffType !== "all") count++;
  if (filters.shift !== "all") count++;
  if (filters.fteMin !== "all") count++;
  if (filters.fteMax !== "all") count++;
  if (showStatus && filters.status !== "all") count++;
  if (filters.employeeType !== "all") count++;
  return count;
}

export function applyPositionFilters<T extends Record<string, any>>(
  data: T[],
  filters: PositionsFilterValues,
  showStatus: boolean,
): T[] {
  let filtered = [...data];
  if (filters.skillMix !== "all") filtered = filtered.filter(r => (r.skillMix ?? r.skill_mix) === filters.skillMix);
  if (filters.staffType !== "all") filtered = filtered.filter(r => r.employmentType === filters.staffType);
  if (filters.shift !== "all") filtered = filtered.filter(r => r.shift === filters.shift);
  if (filters.fteMin !== "all") {
    const min = parseFloat(filters.fteMin);
    filtered = filtered.filter(r => (Number(r.FTE) || 0) >= min);
  }
  if (filters.fteMax !== "all") {
    const max = parseFloat(filters.fteMax);
    filtered = filtered.filter(r => (Number(r.FTE) || 0) <= max);
  }
  if (showStatus && filters.status !== "all") filtered = filtered.filter(r => r.payrollStatus === filters.status);
  if (filters.employeeType !== "all") filtered = filtered.filter(r => r.employeeType === filters.employeeType);
  return filtered;
}

export function PositionsFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  showStatus = false,
  skillMixOptions,
  employeeTypeOptions,
  title = "Filter Positions",
}: PositionsFilterSheetProps) {
  const updateFilter = (key: keyof PositionsFilterValues, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>{title}</SheetTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          <SheetDescription>Apply filters to narrow down the list</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Skill Mix */}
          <div className="space-y-2">
            <Label>Skill Mix</Label>
            <Select value={filters.skillMix} onValueChange={(v) => updateFilter("skillMix", v)}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {skillMixOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff Type */}
          <div className="space-y-2">
            <Label>Staff Type</Label>
            <Select value={filters.staffType} onValueChange={(v) => updateFilter("staffType", v)}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Full-Time">Full-Time</SelectItem>
                <SelectItem value="Part-Time">Part-Time</SelectItem>
                <SelectItem value="PRN">PRN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Shift */}
          <div className="space-y-2">
            <Label>Shift</Label>
            <Select value={filters.shift} onValueChange={(v) => updateFilter("shift", v)}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
                <SelectItem value="Evening">Evening</SelectItem>
                <SelectItem value="Rotating">Rotating</SelectItem>
                <SelectItem value="Weekend Options">Weekend Options</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* FTE Range */}
          <div className="space-y-2">
            <Label>FTE Range</Label>
            <div className="flex gap-2">
              <Select value={filters.fteMin} onValueChange={(v) => updateFilter("fteMin", v)}>
                <SelectTrigger><SelectValue placeholder="Min" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Min</SelectItem>
                  {FTE_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.fteMax} onValueChange={(v) => updateFilter("fteMax", v)}>
                <SelectTrigger><SelectValue placeholder="Max" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Max</SelectItem>
                  {FTE_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status (conditional) */}
          {showStatus && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Leave With Pay">Leave With Pay</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Employee Type */}
          <div className="space-y-2">
            <Label>Employee Type</Label>
            <Select value={filters.employeeType} onValueChange={(v) => updateFilter("employeeType", v)}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {employeeTypeOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={onClearFilters} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
