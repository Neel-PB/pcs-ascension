import { Filter, X } from "@/lib/icons";
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

interface RequisitionsFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    vacancyAgeMin: string;
    vacancyAgeMax: string;
    positionLifecycle: string;
    skillType: string;
    shift: string;
    employmentType: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function RequisitionsFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}: RequisitionsFilterSheetProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filter Requisitions</SheetTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          <SheetDescription>
            Apply filters to narrow down the requisition list
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Vacancy Age (days)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min days"
                value={filters.vacancyAgeMin}
                onChange={(e) => updateFilter("vacancyAgeMin", e.target.value)}
                min="0"
              />
              <Input
                type="number"
                placeholder="Max days"
                value={filters.vacancyAgeMax}
                onChange={(e) => updateFilter("vacancyAgeMax", e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Position Lifecycle</Label>
            <Select value={filters.positionLifecycle} onValueChange={(v) => updateFilter("positionLifecycle", v)}>
              <SelectTrigger>
                <SelectValue placeholder="All lifecycles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lifecycles</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Job Family</Label>
            <Input
              placeholder="Filter by job family"
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
                <SelectItem value="Rotating">Rotating</SelectItem>
                <SelectItem value="Weekend Options">Weekend Options</SelectItem>
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
                <SelectItem value="Full-Time">Full-Time</SelectItem>
                <SelectItem value="Part-Time">Part-Time</SelectItem>
                <SelectItem value="PRN">PRN</SelectItem>
              </SelectContent>
            </Select>
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
