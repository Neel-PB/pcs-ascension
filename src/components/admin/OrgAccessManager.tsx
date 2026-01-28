import { useState, useEffect } from "react";
import { Plus, Trash2, Building2, MapPin, Layers, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFilterData } from "@/hooks/useFilterData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface OrgAccessManagerProps {
  userId: string;
  isEditMode: boolean;
}

interface SelectedAccess {
  markets: Set<string>;
  facilities: Set<string>; // facility_id
  departments: Set<string>; // department_id
}

export function OrgAccessManager({ userId, isEditMode }: OrgAccessManagerProps) {
  const [selectedAccess, setSelectedAccess] = useState<SelectedAccess>({
    markets: new Set(),
    facilities: new Set(),
    departments: new Set(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [marketsOpen, setMarketsOpen] = useState(false);
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  
  const { markets, facilities, departments, isLoading: filterLoading } = useFilterData();
  const queryClient = useQueryClient();
  
  // Fetch existing org access entries when editing
  useEffect(() => {
    if (isEditMode && userId) {
      fetchOrgAccess();
    }
  }, [isEditMode, userId]);
  
  const fetchOrgAccess = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_organization_access')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newAccess: SelectedAccess = {
          markets: new Set(),
          facilities: new Set(),
          departments: new Set(),
        };
        
        data.forEach(d => {
          if (d.market) newAccess.markets.add(d.market);
          if (d.facility_id) newAccess.facilities.add(d.facility_id);
          if (d.department_id) newAccess.departments.add(d.department_id);
        });
        
        setSelectedAccess(newAccess);
        
        // Auto-expand sections with selections
        if (newAccess.markets.size > 0) setMarketsOpen(true);
        if (newAccess.facilities.size > 0) setFacilitiesOpen(true);
        if (newAccess.departments.size > 0) setDepartmentsOpen(true);
      }
    } catch (err) {
      console.error('Error fetching org access:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleMarket = (market: string) => {
    setSelectedAccess(prev => {
      const newMarkets = new Set(prev.markets);
      if (newMarkets.has(market)) {
        newMarkets.delete(market);
      } else {
        newMarkets.add(market);
      }
      return { ...prev, markets: newMarkets };
    });
  };
  
  const toggleFacility = (facilityId: string) => {
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
  
  const toggleDepartment = (departmentId: string) => {
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
  
  const clearAll = () => {
    setSelectedAccess({
      markets: new Set(),
      facilities: new Set(),
      departments: new Set(),
    });
  };
  
  const saveOrgAccess = async () => {
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
        market: string | null;
        facility_id: string | null;
        facility_name: string | null;
        department_id: string | null;
        department_name: string | null;
      }> = [];
      
      // Add market-only entries
      selectedAccess.markets.forEach(market => {
        entries.push({
          user_id: userId,
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
      
      toast.success('Organization access updated');
      queryClient.invalidateQueries({ queryKey: ['user-org-access', userId] });
    } catch (err) {
      console.error('Error saving org access:', err);
      toast.error('Failed to save organization access');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Expose save function for parent form
  useEffect(() => {
    (window as any).__orgAccessSave = saveOrgAccess;
    return () => {
      delete (window as any).__orgAccessSave;
    };
  }, [selectedAccess, userId]);
  
  const totalSelected = selectedAccess.markets.size + selectedAccess.facilities.size + selectedAccess.departments.size;
  
  if (filterLoading || isLoading) {
    return <div className="text-sm text-muted-foreground py-2">Loading...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Organization Access</Label>
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
      
      {/* Markets Section */}
      <Collapsible open={marketsOpen} onOpenChange={setMarketsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Markets</span>
            {selectedAccess.markets.size > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                {selectedAccess.markets.size}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${marketsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="h-[150px] border rounded-md p-2 mt-2">
            <div className="space-y-1">
              {markets.map(market => (
                <label
                  key={market.id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedAccess.markets.has(market.market)}
                    onCheckedChange={() => toggleMarket(market.market)}
                  />
                  <span className="text-sm">{market.market}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Facilities Section */}
      <Collapsible open={facilitiesOpen} onOpenChange={setFacilitiesOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Facilities</span>
            {selectedAccess.facilities.size > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                {selectedAccess.facilities.size}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${facilitiesOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="h-[200px] border rounded-md p-2 mt-2">
            <div className="space-y-1">
              {facilities.map(facility => (
                <label
                  key={facility.id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedAccess.facilities.has(facility.facility_id)}
                    onCheckedChange={() => toggleFacility(facility.facility_id)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm">{facility.facility_name}</span>
                    <span className="text-xs text-muted-foreground">{facility.market}</span>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Departments Section */}
      <Collapsible open={departmentsOpen} onOpenChange={setDepartmentsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Departments</span>
            {selectedAccess.departments.size > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                {selectedAccess.departments.size}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${departmentsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="h-[200px] border rounded-md p-2 mt-2">
            <div className="space-y-1">
              {departments.map(dept => {
                const facility = facilities.find(f => f.facility_id === dept.facility_id);
                return (
                  <label
                    key={dept.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedAccess.departments.has(dept.department_id)}
                      onCheckedChange={() => toggleDepartment(dept.department_id)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{dept.department_name}</span>
                      <span className="text-xs text-muted-foreground">{facility?.facility_name || dept.facility_id}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
      
      <p className="text-xs text-muted-foreground">
        Select specific items to restrict user access. Leave empty for full access.
      </p>
    </div>
  );
}
