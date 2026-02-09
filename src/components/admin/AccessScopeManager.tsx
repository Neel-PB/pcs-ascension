import { useState, useEffect, useMemo } from "react";
import { Globe, MapPin, Building2, Layers, Plus, X, Search, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useFilterData } from "@/hooks/useFilterData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MultiSelectChips, type MultiSelectOption } from "@/components/ui/multi-select-chips";
import { cn } from "@/lib/utils";

interface AccessScopeManagerProps {
  userId: string;
  isEditMode: boolean;
}

interface SelectedAccess {
  regions: Set<string>;
  markets: Set<string>;
  facilities: Set<string>; // facility_id
  departments: Set<string>; // department_id
}

export function AccessScopeManager({ userId, isEditMode }: AccessScopeManagerProps) {
  const [selectedAccess, setSelectedAccess] = useState<SelectedAccess>({
    regions: new Set(),
    markets: new Set(),
    facilities: new Set(),
    departments: new Set(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [facilitySearch, setFacilitySearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  
  const { regions, markets, facilities, departments, isLoading: filterLoading, getMarketsByRegion, getFacilitiesByMarket, getDepartmentsByFacility } = useFilterData();
  const queryClient = useQueryClient();
  
  // Fetch existing access scope entries when editing
  useEffect(() => {
    if (isEditMode && userId) {
      fetchAccessScope();
    }
  }, [isEditMode, userId]);
  
  const fetchAccessScope = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_organization_access')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newAccess: SelectedAccess = {
          regions: new Set(),
          markets: new Set(),
          facilities: new Set(),
          departments: new Set(),
        };
        
        data.forEach(d => {
          if (d.region) newAccess.regions.add(d.region);
          if (d.market) newAccess.markets.add(d.market);
          if (d.facility_id) newAccess.facilities.add(d.facility_id);
          if (d.department_id) newAccess.departments.add(d.department_id);
        });
        
        setSelectedAccess(newAccess);
      }
    } catch (err) {
      console.error('Error fetching access scope:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegionsChange = (values: string[]) => {
    setSelectedAccess(prev => ({ ...prev, regions: new Set(values) }));
  };

  const handleMarketsChange = (values: string[]) => {
    setSelectedAccess(prev => ({ ...prev, markets: new Set(values) }));
  };

  const handleFacilityToggle = (facilityId: string) => {
    setSelectedAccess(prev => {
      const newFacilities = new Set(prev.facilities);
      if (newFacilities.has(facilityId)) {
        newFacilities.delete(facilityId);
      } else {
        newFacilities.add(facilityId);
      }
      return { ...prev, facilities: newFacilities };
    });
  };

  const handleFacilityRemove = (facilityId: string) => {
    setSelectedAccess(prev => {
      const newFacilities = new Set(prev.facilities);
      newFacilities.delete(facilityId);
      return { ...prev, facilities: newFacilities };
    });
  };

  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedAccess(prev => {
      const newDepartments = new Set(prev.departments);
      if (newDepartments.has(departmentId)) {
        newDepartments.delete(departmentId);
      } else {
        newDepartments.add(departmentId);
      }
      return { ...prev, departments: newDepartments };
    });
  };

  const handleDepartmentRemove = (departmentId: string) => {
    setSelectedAccess(prev => {
      const newDepartments = new Set(prev.departments);
      newDepartments.delete(departmentId);
      return { ...prev, departments: newDepartments };
    });
  };
  
  const clearAll = () => {
    setSelectedAccess({
      regions: new Set(),
      markets: new Set(),
      facilities: new Set(),
      departments: new Set(),
    });
  };
  
  const saveAccessScope = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Delete existing entries
      await supabase
        .from('user_organization_access')
        .delete()
        .eq('user_id', userId);
      
      // Build flat entries for each selected item
      const entries: Array<{
        user_id: string;
        region: string | null;
        market: string | null;
        facility_id: string | null;
        facility_name: string | null;
        department_id: string | null;
        department_name: string | null;
      }> = [];
      
      // Add region-only entries
      selectedAccess.regions.forEach(region => {
        entries.push({
          user_id: userId,
          region,
          market: null,
          facility_id: null,
          facility_name: null,
          department_id: null,
          department_name: null,
        });
      });
      
      // Add market-only entries
      selectedAccess.markets.forEach(market => {
        entries.push({
          user_id: userId,
          region: null,
          market,
          facility_id: null,
          facility_name: null,
          department_id: null,
          department_name: null,
        });
      });
      
      // Add facility entries
      selectedAccess.facilities.forEach(facilityId => {
        const facility = facilities.find(f => f.facility_id === facilityId);
        entries.push({
          user_id: userId,
          region: null,
          market: facility?.market || null,
          facility_id: facilityId,
          facility_name: facility?.facility_name || null,
          department_id: null,
          department_name: null,
        });
      });
      
      // Add department entries
      selectedAccess.departments.forEach(departmentId => {
        const dept = departments.find(d => d.department_id === departmentId);
        const facility = dept ? facilities.find(f => f.facility_id === dept.facility_id) : null;
        entries.push({
          user_id: userId,
          region: null,
          market: facility?.market || null,
          facility_id: dept?.facility_id || null,
          facility_name: facility?.facility_name || null,
          department_id: departmentId,
          department_name: dept?.department_name || null,
        });
      });
      
      if (entries.length > 0) {
        const { error } = await supabase
          .from('user_organization_access')
          .insert(entries);
        
        if (error) throw error;
      }
      
      toast.success('Access scope updated');
      queryClient.invalidateQueries({ queryKey: ['user-access-scope', userId] });
    } catch (err) {
      console.error('Error saving access scope:', err);
      toast.error('Failed to save access scope');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Expose save function for parent form
  useEffect(() => {
    (window as any).__accessScopeSave = saveAccessScope;
    return () => {
      delete (window as any).__accessScopeSave;
    };
  }, [selectedAccess, userId]);

  // Build options for Region (no cascading needed)
  const regionOptions: MultiSelectOption[] = regions.map(r => ({
    value: r.region,
    label: r.region,
  }));

  // Cascading: Markets filtered by selected Regions
  const filteredMarkets = useMemo(() => {
    if (selectedAccess.regions.size === 0) {
      return markets;
    }
    return markets.filter(m => m.region && selectedAccess.regions.has(m.region));
  }, [markets, selectedAccess.regions]);

  const marketOptions: MultiSelectOption[] = filteredMarkets.map(m => ({
    value: m.market,
    label: m.market,
    description: m.region || undefined,
  }));

  // Cascading: Facilities filtered by selected Markets (or Regions if no Markets selected)
  const filteredFacilities = useMemo(() => {
    if (selectedAccess.markets.size > 0) {
      return facilities.filter(f => selectedAccess.markets.has(f.market));
    }
    if (selectedAccess.regions.size > 0) {
      return facilities.filter(f => f.region && selectedAccess.regions.has(f.region));
    }
    return facilities;
  }, [facilities, selectedAccess.markets, selectedAccess.regions]);

  // Filter facilities by search
  const searchedFacilities = useMemo(() => {
    if (!facilitySearch) return filteredFacilities;
    const query = facilitySearch.toLowerCase();
    return filteredFacilities.filter(f => 
      f.facility_name.toLowerCase().includes(query) ||
      f.facility_id.toLowerCase().includes(query)
    );
  }, [filteredFacilities, facilitySearch]);

  // Cascading: Departments filtered by selected Facilities (or cascade from Markets/Regions)
  const filteredDepartments = useMemo(() => {
    if (selectedAccess.facilities.size > 0) {
      return departments.filter(d => selectedAccess.facilities.has(d.facility_id));
    }
    if (selectedAccess.markets.size > 0) {
      const facilityIds = facilities
        .filter(f => selectedAccess.markets.has(f.market))
        .map(f => f.facility_id);
      return departments.filter(d => facilityIds.includes(d.facility_id));
    }
    if (selectedAccess.regions.size > 0) {
      const facilityIds = facilities
        .filter(f => f.region && selectedAccess.regions.has(f.region))
        .map(f => f.facility_id);
      return departments.filter(d => facilityIds.includes(d.facility_id));
    }
    return departments;
  }, [departments, facilities, selectedAccess.facilities, selectedAccess.markets, selectedAccess.regions]);

  // Filter departments by search
  const searchedDepartments = useMemo(() => {
    if (!departmentSearch) return filteredDepartments;
    const query = departmentSearch.toLowerCase();
    return filteredDepartments.filter(d => 
      d.department_name.toLowerCase().includes(query) ||
      d.department_id.toLowerCase().includes(query)
    );
  }, [filteredDepartments, departmentSearch]);

  // Get selected facility objects for chips display
  const selectedFacilityObjects = useMemo(() => {
    return facilities.filter(f => selectedAccess.facilities.has(f.facility_id));
  }, [facilities, selectedAccess.facilities]);

  // Get selected department objects for chips display
  const selectedDepartmentObjects = useMemo(() => {
    return departments.filter(d => selectedAccess.departments.has(d.department_id));
  }, [departments, selectedAccess.departments]);
  
  const totalSelected = selectedAccess.regions.size + selectedAccess.markets.size + 
                        selectedAccess.facilities.size + selectedAccess.departments.size;
  
  if (filterLoading || isLoading) {
    return <div className="text-sm text-muted-foreground py-2">Loading...</div>;
  }
  
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Access Scope</Label>
        {totalSelected > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear All ({totalSelected})
          </Button>
        )}
      </div>
      
      {totalSelected === 0 ? (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-3 text-center">
          No restrictions. User can access all data.
          <br />
          <span className="text-xs">Select items below to restrict access.</span>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground bg-primary/10 border border-primary/20 rounded-md p-3">
          <span className="font-medium text-foreground">{totalSelected}</span> restriction{totalSelected !== 1 ? 's' : ''} applied
        </div>
      )}
      
      {/* Region */}
      <MultiSelectChips
        label="Region"
        icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        options={regionOptions}
        selected={Array.from(selectedAccess.regions)}
        onChange={handleRegionsChange}
        placeholder="Search regions..."
        addButtonText="Add"
        emptyText="No restrictions"
      />
      
      {/* Market - Cascaded by Region */}
      <MultiSelectChips
        label="Market"
        icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        options={marketOptions}
        selected={Array.from(selectedAccess.markets)}
        onChange={handleMarketsChange}
        placeholder="Search markets..."
        addButtonText="Add"
        emptyText="No restrictions"
      />
      
      {/* Facility - Searchable Two-Column Layout */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Facility</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {selectedFacilityObjects.length > 0 ? (
            selectedFacilityObjects.map((facility) => (
              <Badge
                key={facility.facility_id}
                variant="secondary"
                className="pl-2.5 pr-1 py-1 flex items-center gap-1.5 text-sm"
              >
                <span className="max-w-[150px] truncate">{facility.facility_name}</span>
                <span className="text-xs text-muted-foreground font-mono">{facility.facility_id}</span>
                <button
                  type="button"
                  onClick={() => handleFacilityRemove(facility.facility_id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No restrictions</span>
          )}

          <Popover open={facilityOpen} onOpenChange={setFacilityOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[520px] p-0 bg-popover" 
              align="start"
            >
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={facilitySearch}
                    onChange={(e) => setFacilitySearch(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
              </div>
              <ScrollArea className="max-h-[300px]">
                <div className="p-1">
                  {searchedFacilities.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No facilities found
                    </div>
                  ) : (
                    searchedFacilities.map((facility) => {
                      const isSelected = selectedAccess.facilities.has(facility.facility_id);
                      return (
                        <div
                          key={facility.facility_id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleFacilityToggle(facility.facility_id)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                            isSelected 
                              ? "bg-primary/15 border border-primary/30" 
                              : "border border-transparent hover:bg-muted/50"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            className="shrink-0 pointer-events-none"
                          />
                          <div className="flex-1 min-w-0 grid grid-cols-[minmax(0,1fr)_80px] gap-2 items-center">
                            <span className="text-sm whitespace-normal break-words">
                              {facility.facility_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-px h-4 bg-border" />
                              <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                {facility.facility_id}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Department - Searchable Two-Column Layout */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Department</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {selectedDepartmentObjects.length > 0 ? (
            selectedDepartmentObjects.map((dept) => (
              <Badge
                key={dept.department_id}
                variant="secondary"
                className="pl-2.5 pr-1 py-1 flex items-center gap-1.5 text-sm"
              >
                <span className="max-w-[150px] truncate">{dept.department_name}</span>
                <span className="text-xs text-muted-foreground font-mono">{dept.department_id}</span>
                <button
                  type="button"
                  onClick={() => handleDepartmentRemove(dept.department_id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No restrictions</span>
          )}

          <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[520px] p-0 bg-popover" 
              align="start"
            >
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={departmentSearch}
                    onChange={(e) => setDepartmentSearch(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
              </div>
              <ScrollArea className="max-h-[300px]">
                <div className="p-1">
                  {searchedDepartments.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No departments found
                    </div>
                  ) : (
                    searchedDepartments.map((dept) => {
                      const isSelected = selectedAccess.departments.has(dept.department_id);
                      return (
                        <div
                          key={dept.department_id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleDepartmentToggle(dept.department_id)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                            isSelected 
                              ? "bg-primary/15 border border-primary/30" 
                              : "border border-transparent hover:bg-muted/50"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            className="shrink-0 pointer-events-none"
                          />
                          <div className="flex-1 min-w-0 grid grid-cols-[minmax(0,1fr)_80px] gap-2 items-center">
                            <span className="text-sm whitespace-normal break-words">
                              {dept.department_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-px h-4 bg-border" />
                              <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                {dept.department_id}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Select specific items to restrict user access. Leave empty for full access.
      </p>
    </div>
  );
}

// Backward compatibility export
export const OrgAccessManager = AccessScopeManager;
