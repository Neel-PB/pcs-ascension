import { Filter, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface EmployeesFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    status: string;
    employmentType: string;
    skillType: string;
    shift: string;
    fteMin: string;
    fteMax: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function EmployeesFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}: EmployeesFilterSheetProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filter Employees</SheetTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          <SheetDescription>
            Apply filters to narrow down the employee list
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select value={filters.employmentType} onValueChange={(v) => updateFilter("employmentType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Full Time">Full Time</SelectItem>
                <SelectItem value="Part Time">Part Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Skill Type</Label>
            <Input
              placeholder="Filter by skill type"
              value={filters.skillType}
              onChange={(e) => updateFilter("skillType", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Shift</Label>
            <Select value={filters.shift} onValueChange={(v) => updateFilter("shift", v)}>
              <SelectTrigger>
                <SelectValue placeholder="All shifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All shifts</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
                <SelectItem value="Evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>FTE Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.fteMin}
                onChange={(e) => updateFilter("fteMin", e.target.value)}
                step="0.1"
                min="0"
                max="1"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.fteMax}
                onChange={(e) => updateFilter("fteMax", e.target.value)}
                step="0.1"
                min="0"
                max="1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClearFilters} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
