import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EditableTable } from '@/components/editable-table/EditableTable';
import { createVolumeOverrideColumns, VolumeOverrideRow } from '@/config/volumeOverrideColumns';
import { useVolumeOverrides, useUpsertVolumeOverride, useDeleteVolumeOverride } from '@/hooks/useVolumeOverrides';
import { Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsTabProps {
  selectedMarket: string;
  selectedFacility: string;
}

export function SettingsTab({ selectedMarket, selectedFacility }: SettingsTabProps) {
  const { data: overrides = [], isLoading: isLoadingOverrides } = useVolumeOverrides(selectedFacility);
  const upsertMutation = useUpsertVolumeOverride();
  const deleteMutation = useDeleteVolumeOverride();

  // Fetch departments for the selected facility
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments', selectedFacility],
    queryFn: async () => {
      if (!selectedFacility || selectedFacility === 'all-facilities') return [];
      
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('facility_id', selectedFacility)
        .order('department_name');

      if (error) throw error;
      return data;
    },
    enabled: !!selectedFacility && selectedFacility !== 'all-facilities',
  });

  // Fetch facility details for the selected facility
  const { data: facilityData } = useQuery({
    queryKey: ['facility', selectedFacility],
    queryFn: async () => {
      if (!selectedFacility || selectedFacility === 'all-facilities') return null;
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('facility_id', selectedFacility)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedFacility && selectedFacility !== 'all-facilities',
  });

  // Merge departments with overrides
  const tableData = useMemo((): VolumeOverrideRow[] => {
    if (!departments.length) return [];

    return departments.map((dept) => {
      const override = overrides.find((o) => o.department_id === dept.department_id);
      
      return {
        id: override?.id || `dept-${dept.department_id}`,
        department_id: dept.department_id,
        department_name: dept.department_name,
        override_volume: override?.override_volume || null,
        expiry_date: override?.expiry_date || null,
        market: selectedMarket,
        facility_id: selectedFacility,
        facility_name: facilityData?.facility_name || '',
      };
    });
  }, [departments, overrides, selectedMarket, selectedFacility, facilityData]);

  const handleSaveVolume = async (departmentId: string, volume: number | null) => {
    const row = tableData.find((r) => r.department_id === departmentId);
    if (!row) return;

    // If volume is null or no expiry date, we can't save
    if (!volume) return;

    // Require expiry date
    if (!row.expiry_date) {
      return;
    }

    await upsertMutation.mutateAsync({
      market: row.market,
      facility_id: row.facility_id,
      facility_name: row.facility_name,
      department_id: row.department_id,
      department_name: row.department_name,
      override_volume: volume,
      expiry_date: row.expiry_date,
    });
  };

  const handleSaveDate = async (departmentId: string, date: string | null) => {
    const row = tableData.find((r) => r.department_id === departmentId);
    if (!row) return;

    // If date is null or no volume, we can't save
    if (!date) return;

    // Require volume
    if (!row.override_volume) {
      return;
    }

    await upsertMutation.mutateAsync({
      market: row.market,
      facility_id: row.facility_id,
      facility_name: row.facility_name,
      department_id: row.department_id,
      department_name: row.department_name,
      override_volume: row.override_volume,
      expiry_date: date,
    });
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('dept-')) return; // No override to delete
    
    await deleteMutation.mutateAsync({ 
      id, 
      facilityId: selectedFacility 
    });
  };

  const columns = useMemo(
    () => createVolumeOverrideColumns(handleSaveVolume, handleSaveDate, handleDelete),
    [tableData]
  );

  // Show message if no facility selected
  if (!selectedFacility || selectedFacility === 'all-facilities') {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <Database className="h-16 w-16 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Select a Facility</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Please select a specific facility from the filters above to view and manage override volumes for its departments.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoadingDepartments || isLoadingOverrides) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Loading departments...</div>
      </div>
    );
  }

  // Show empty state if no departments
  if (!departments.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <Database className="h-16 w-16 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Departments Found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No departments found for the selected facility. Please check your data or select a different facility.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Set override volumes for specific departments. Both override volume and expiry date are required to save changes. 
          After the expiry date, the system will revert to using the target volume.
        </AlertDescription>
      </Alert>

      <EditableTable
        columns={columns}
        data={tableData}
        getRowId={(row) => row.id}
        storeNamespace="volume-override-settings"
      />
    </div>
  );
}
