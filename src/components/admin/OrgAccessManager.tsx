import { useState, useEffect } from "react";
import { Plus, Trash2, Building2, MapPin, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFilterData } from "@/hooks/useFilterData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface OrgAccessEntry {
  id?: string;
  market: string;
  facilityId: string;
  facilityName: string;
  departmentId: string;
  departmentName: string;
}

interface OrgAccessManagerProps {
  userId: string;
  isEditMode: boolean;
}

export function OrgAccessManager({ userId, isEditMode }: OrgAccessManagerProps) {
  const [entries, setEntries] = useState<OrgAccessEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { markets, getFacilitiesByMarket, getDepartmentsByFacility, isLoading: filterLoading } = useFilterData();
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
        setEntries(data.map(d => ({
          id: d.id,
          market: d.market || '',
          facilityId: d.facility_id || '',
          facilityName: d.facility_name || '',
          departmentId: d.department_id || '',
          departmentName: d.department_name || '',
        })));
      }
    } catch (err) {
      console.error('Error fetching org access:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addEntry = () => {
    setEntries([...entries, {
      market: '',
      facilityId: '',
      facilityName: '',
      departmentId: '',
      departmentName: '',
    }]);
  };
  
  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };
  
  const updateEntry = (index: number, field: keyof OrgAccessEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    
    // Clear child selections when parent changes
    if (field === 'market') {
      updated[index].facilityId = '';
      updated[index].facilityName = '';
      updated[index].departmentId = '';
      updated[index].departmentName = '';
    } else if (field === 'facilityId') {
      updated[index].departmentId = '';
      updated[index].departmentName = '';
      // Set facility name
      const facilities = getFacilitiesByMarket(updated[index].market);
      const facility = facilities.find(f => f.facility_id === value);
      updated[index].facilityName = facility?.facility_name || '';
    } else if (field === 'departmentId') {
      // Set department name
      const departments = getDepartmentsByFacility(updated[index].facilityId);
      const dept = departments.find(d => d.department_id === value);
      updated[index].departmentName = dept?.department_name || '';
    }
    
    setEntries(updated);
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
      
      // Insert new entries (only those with at least a market selected)
      const validEntries = entries.filter(e => e.market);
      
      if (validEntries.length > 0) {
        const { error } = await supabase
          .from('user_organization_access')
          .insert(validEntries.map(e => ({
            user_id: userId,
            market: e.market || null,
            facility_id: e.facilityId || null,
            facility_name: e.facilityName || null,
            department_id: e.departmentId || null,
            department_name: e.departmentName || null,
          })));
        
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
    // Store save function on window for parent access
    (window as any).__orgAccessSave = saveOrgAccess;
    return () => {
      delete (window as any).__orgAccessSave;
    };
  }, [entries, userId]);
  
  if (filterLoading || isLoading) {
    return <div className="text-sm text-muted-foreground py-2">Loading...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Organization Access</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEntry}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Location
        </Button>
      </div>
      
      {entries.length === 0 ? (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-3 text-center">
          No location restrictions. User can access all data.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={index} className="border rounded-md p-3 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Location {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(index)}
                  className="h-6 w-6 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Market */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Market</span>
                </div>
                <Select
                  value={entry.market}
                  onValueChange={(value) => updateEntry(index, 'market', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map(m => (
                      <SelectItem key={m.id} value={m.market}>{m.market}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Facility */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>Facility (optional)</span>
                </div>
                <Select
                  value={entry.facilityId}
                  onValueChange={(value) => updateEntry(index, 'facilityId', value)}
                  disabled={!entry.market}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="All facilities in market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All facilities</SelectItem>
                    {getFacilitiesByMarket(entry.market).map(f => (
                      <SelectItem key={f.id} value={f.facility_id}>{f.facility_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Department */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Layers className="h-3 w-3" />
                  <span>Department (optional)</span>
                </div>
                <Select
                  value={entry.departmentId}
                  onValueChange={(value) => updateEntry(index, 'departmentId', value)}
                  disabled={!entry.facilityId}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="All departments in facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All departments</SelectItem>
                    {getDepartmentsByFacility(entry.facilityId).map(d => (
                      <SelectItem key={d.id} value={d.department_id}>{d.department_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {entries.length > 0 && (
        <p className="text-xs text-muted-foreground">
          User will only see data matching these locations. Changes are saved when you update the user.
        </p>
      )}
    </div>
  );
}
