import { useState, useEffect } from "react";
import { Globe, MapPin, Building2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFilterData } from "@/hooks/useFilterData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MultiSelectChips, type MultiSelectOption } from "@/components/ui/multi-select-chips";

interface OrgAccessManagerProps {
  userId: string;
  isEditMode: boolean;
}

interface SelectedAccess {
  regions: Set<string>;
  markets: Set<string>;
  facilities: Set<string>; // facility_id
  departments: Set<string>; // department_id
}

export function OrgAccessManager({ userId, isEditMode }: OrgAccessManagerProps) {
  const [selectedAccess, setSelectedAccess] = useState<SelectedAccess>({
    regions: new Set(),
    markets: new Set(),
    facilities: new Set(),
    departments: new Set(),
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { regions, markets, facilities, departments, isLoading: filterLoading } = useFilterData();
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
      console.error('Error fetching org access:', err);
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

  const handleFacilitiesChange = (values: string[]) => {
    setSelectedAccess(prev => ({ ...prev, facilities: new Set(values) }));
  };

  const handleDepartmentsChange = (values: string[]) => {
    setSelectedAccess(prev => ({ ...prev, departments: new Set(values) }));
  };
  
  const clearAll = () => {
    setSelectedAccess({
      regions: new Set(),
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

  // Build options for each level
  const regionOptions: MultiSelectOption[] = regions.map(r => ({
    value: r.region,
    label: r.region,
  }));

  const marketOptions: MultiSelectOption[] = markets.map(m => ({
    value: m.market,
    label: m.market,
    description: m.region || undefined,
  }));

  const facilityOptions: MultiSelectOption[] = facilities.map(f => ({
    value: f.facility_id,
    label: f.facility_name,
    description: f.market,
  }));

  const departmentOptions: MultiSelectOption[] = departments.map(d => {
    const facility = facilities.find(f => f.facility_id === d.facility_id);
    return {
      value: d.department_id,
      label: d.department_name,
      description: facility?.facility_name || d.facility_id,
    };
  });
  
  const totalSelected = selectedAccess.regions.size + selectedAccess.markets.size + 
                        selectedAccess.facilities.size + selectedAccess.departments.size;
  
  if (filterLoading || isLoading) {
    return <div className="text-sm text-muted-foreground py-2">Loading...</div>;
  }
  
  return (
    <div className="space-y-5">
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
      
      {/* Market */}
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
      
      {/* Facility */}
      <MultiSelectChips
        label="Facility"
        icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        options={facilityOptions}
        selected={Array.from(selectedAccess.facilities)}
        onChange={handleFacilitiesChange}
        placeholder="Search facilities..."
        addButtonText="Add"
        emptyText="No restrictions"
      />
      
      {/* Department */}
      <MultiSelectChips
        label="Department"
        icon={<Layers className="h-4 w-4 text-muted-foreground" />}
        options={departmentOptions}
        selected={Array.from(selectedAccess.departments)}
        onChange={handleDepartmentsChange}
        placeholder="Search departments..."
        addButtonText="Add"
        emptyText="No restrictions"
      />
      
      <p className="text-xs text-muted-foreground">
        Select specific items to restrict user access. Leave empty for full access.
      </p>
    </div>
  );
}
