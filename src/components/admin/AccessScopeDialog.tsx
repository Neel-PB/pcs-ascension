import { useState, useMemo } from "react";
import { Globe, MapPin, Building2, Layers, Search } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useFilterData } from "@/hooks/useFilterData";
import { cn } from "@/lib/utils";
import type { SelectedAccess } from "./AccessScopeManager";

interface AccessScopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAccess: SelectedAccess;
  onDone: (access: SelectedAccess) => void;
}

export function AccessScopeDialog({
  open,
  onOpenChange,
  initialAccess,
  onDone,
}: AccessScopeDialogProps) {
  const [access, setAccess] = useState<SelectedAccess>(initialAccess);
  const [facilitySearch, setFacilitySearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");

  const { regions, markets, facilities, departments, isLoading } = useFilterData();

  // Reset local state when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setAccess(initialAccess);
      setFacilitySearch("");
      setDepartmentSearch("");
    }
    onOpenChange(isOpen);
  };

  const toggleSet = (set: Set<string>, value: string): Set<string> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  // Cascading filters
  const filteredMarkets = useMemo(() => {
    if (access.regions.size === 0) return markets;
    return markets.filter((m) => m.region && access.regions.has(m.region));
  }, [markets, access.regions]);

  const filteredFacilities = useMemo(() => {
    if (access.markets.size > 0) return facilities.filter((f) => access.markets.has(f.market));
    if (access.regions.size > 0) return facilities.filter((f) => f.region && access.regions.has(f.region));
    return facilities;
  }, [facilities, access.markets, access.regions]);

  const searchedFacilities = useMemo(() => {
    if (!facilitySearch) return filteredFacilities;
    const q = facilitySearch.toLowerCase();
    return filteredFacilities.filter(
      (f) => f.facility_name.toLowerCase().includes(q) || f.facility_id.toLowerCase().includes(q)
    );
  }, [filteredFacilities, facilitySearch]);

  const filteredDepartments = useMemo(() => {
    let result: typeof departments;
    if (access.facilities.size > 0) {
      result = departments.filter((d) => access.facilities.has(d.facility_id));
    } else if (access.markets.size > 0) {
      const fIds = facilities.filter((f) => access.markets.has(f.market)).map((f) => f.facility_id);
      result = departments.filter((d) => fIds.includes(d.facility_id));
    } else if (access.regions.size > 0) {
      const fIds = facilities.filter((f) => f.region && access.regions.has(f.region)).map((f) => f.facility_id);
      result = departments.filter((d) => fIds.includes(d.facility_id));
    } else {
      result = departments;
    }
    const seen = new Map<string, (typeof departments)[0]>();
    for (const d of result) {
      if (!seen.has(d.department_id)) seen.set(d.department_id, d);
    }
    return Array.from(seen.values());
  }, [departments, facilities, access.facilities, access.markets, access.regions]);

  const searchedDepartments = useMemo(() => {
    if (!departmentSearch) return filteredDepartments;
    const q = departmentSearch.toLowerCase();
    return filteredDepartments.filter(
      (d) => d.department_name.toLowerCase().includes(q) || d.department_id.toLowerCase().includes(q)
    );
  }, [filteredDepartments, departmentSearch]);

  const totalSelected =
    access.regions.size + access.markets.size + access.facilities.size + access.departments.size;

  const clearAll = () =>
    setAccess({ regions: new Set(), markets: new Set(), facilities: new Set(), departments: new Set() });

  const handleDone = () => {
    onDone(access);
    onOpenChange(false);
  };

  const SectionHeader = ({
    icon,
    label,
    count,
  }: {
    icon: React.ReactNode;
    label: string;
    count: number;
  }) => (
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {count > 0 && (
        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
          {count}
        </Badge>
      )}
    </div>
  );

  const CheckboxRow = ({
    label,
    sublabel,
    checked,
    onToggle,
  }: {
    label: string;
    sublabel?: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div
      role="option"
      aria-selected={checked}
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
        checked ? "bg-primary/15 border border-primary/30" : "border border-transparent hover:bg-muted/50"
      )}
    >
      <Checkbox checked={checked} className="shrink-0 pointer-events-none" />
      <span className="text-sm flex-1 min-w-0 truncate">{label}</span>
      {sublabel && (
        <>
          <div className="w-px h-4 bg-border shrink-0" />
          <span className="text-xs text-muted-foreground font-mono shrink-0">{sublabel}</span>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Configure Access Scope</DialogTitle>
          <DialogDescription>
            Select items to restrict access. Leave empty for full access.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 pb-4">
            {/* Region */}
            <div>
              <SectionHeader
                icon={<Globe className="h-4 w-4 text-muted-foreground" />}
                label="Region"
                count={access.regions.size}
              />
              <div className="space-y-0.5 rounded-md border border-border/50 p-1">
                {regions.map((r) => (
                  <CheckboxRow
                    key={r.region}
                    label={r.region}
                    checked={access.regions.has(r.region)}
                    onToggle={() =>
                      setAccess((prev) => ({ ...prev, regions: toggleSet(prev.regions, r.region) }))
                    }
                  />
                ))}
                {regions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">No regions available</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Market */}
            <div>
              <SectionHeader
                icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                label="Market"
                count={access.markets.size}
              />
              <div className="space-y-0.5 rounded-md border border-border/50 p-1">
                {filteredMarkets.map((m) => (
                  <CheckboxRow
                    key={m.market}
                    label={m.market}
                    sublabel={m.region || undefined}
                    checked={access.markets.has(m.market)}
                    onToggle={() =>
                      setAccess((prev) => ({ ...prev, markets: toggleSet(prev.markets, m.market) }))
                    }
                  />
                ))}
                {filteredMarkets.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">No markets available</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Facility */}
            <div>
              <SectionHeader
                icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
                label="Facility"
                count={access.facilities.size}
              />
              <div className="rounded-md border border-border/50">
                <div className="p-1.5 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={facilitySearch}
                      onChange={(e) => setFacilitySearch(e.target.value)}
                      className="pl-7 h-7 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-0.5 p-1">
                  {searchedFacilities.map((f) => (
                    <CheckboxRow
                      key={f.facility_id}
                      label={f.facility_name}
                      sublabel={f.facility_id}
                      checked={access.facilities.has(f.facility_id)}
                      onToggle={() =>
                        setAccess((prev) => ({
                          ...prev,
                          facilities: toggleSet(prev.facilities, f.facility_id),
                        }))
                      }
                    />
                  ))}
                  {searchedFacilities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No facilities found</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Department */}
            <div>
              <SectionHeader
                icon={<Layers className="h-4 w-4 text-muted-foreground" />}
                label="Department"
                count={access.departments.size}
              />
              <div className="rounded-md border border-border/50">
                <div className="p-1.5 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={departmentSearch}
                      onChange={(e) => setDepartmentSearch(e.target.value)}
                      className="pl-7 h-7 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-0.5 max-h-[200px] overflow-y-auto p-1">
                  {searchedDepartments.map((d) => (
                    <CheckboxRow
                      key={d.department_id}
                      label={d.department_name}
                      sublabel={d.department_id}
                      checked={access.departments.has(d.department_id)}
                      onToggle={() =>
                        setAccess((prev) => ({
                          ...prev,
                          departments: toggleSet(prev.departments, d.department_id),
                        }))
                      }
                    />
                  ))}
                  {searchedDepartments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No departments found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={clearAll} disabled={totalSelected === 0}>
            Clear All
          </Button>
          <Button type="button" onClick={handleDone}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
