import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EditableTable } from '@/components/editable-table/EditableTable';
import { createVolumeOverrideColumns, VolumeOverrideRow } from '@/config/volumeOverrideColumns';
import { useVolumeOverrides, useUpsertVolumeOverride, useDeleteVolumeOverride } from '@/hooks/useVolumeOverrides';
import { useHistoricalVolumeAnalysis, useVolumeOverrideConfig } from '@/hooks/useHistoricalVolumeAnalysis';
import { Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoLoader } from '@/components/ui/LogoLoader';

interface SettingsTabProps {
  selectedMarket: string;
  selectedFacility: string;
}

export function SettingsTab({ selectedMarket, selectedFacility }: SettingsTabProps) {
  const { data: overrides = [], isLoading: isLoadingOverrides } = useVolumeOverrides(selectedFacility);
  const { data: volumeAnalysis = [], isLoading: isLoadingAnalysis } = useHistoricalVolumeAnalysis();
  const { data: config } = useVolumeOverrideConfig();
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

  // Merge departments with overrides and historical analysis
  const tableData = useMemo((): VolumeOverrideRow[] => {
    if (!departments.length) return [];

    return departments.map((dept) => {
      const override = overrides.find((o) => o.department_id === dept.department_id);
      const analysis = volumeAnalysis.find(
        (a) => a.facility_id === selectedFacility && a.department_id === dept.department_id
      );
      
      return {
        id: override?.id || `dept-${dept.department_id}`,
        department_id: dept.department_id,
        department_name: dept.department_name,
        override_volume: override?.override_volume || null,
        expiry_date: override?.expiry_date || null,
        market: selectedMarket,
        facility_id: selectedFacility,
        facility_name: facilityData?.facility_name || '',
        // Historical analysis data
        historical_months_count: analysis?.historical_months_count,
        historical_months_data: analysis?.historical_months_data,
        target_volume: analysis?.target_volume,
        override_mandatory: analysis?.override_mandatory,
        max_allowed_expiry_date: analysis?.max_allowed_expiry_date,
        category: analysis?.category,
        // New 3-month low fields
        three_month_low_avg: analysis?.three_month_low_avg,
        n_month_avg: analysis?.n_month_avg,
        spread_percentage: analysis?.spread_percentage,
        used_three_month_low: analysis?.used_three_month_low,
        lowest_three_months: analysis?.lowest_three_months,
      };
    });
  }, [departments, overrides, volumeAnalysis, selectedMarket, selectedFacility, facilityData]);

  // Calculate warning stats
  const stats = useMemo(() => {
    const mandatoryCount = tableData.filter(row => row.override_mandatory && !row.override_volume).length;
    const expiringSoonCount = tableData.filter(row => {
      if (!row.expiry_date) return false;
      const daysUntilExpiry = Math.ceil((new Date(row.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    }).length;
    const usingTargetCount = tableData.filter(row => !row.override_volume && row.target_volume).length;

    return { mandatoryCount, expiringSoonCount, usingTargetCount };
  }, [tableData]);

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
    () => createVolumeOverrideColumns(handleSaveVolume, handleSaveDate, config ?? undefined),
    [tableData, config]
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
  if (isLoadingDepartments || isLoadingOverrides || isLoadingAnalysis) {
    return (
      <div className="flex items-center justify-center h-96">
        <LogoLoader size="lg" />
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
      {/* Consolidated Stats Banner */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-8">
          {/* Require Override Stat */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stats.mandatoryCount > 0 ? 'bg-destructive' : 'bg-green-500'}`} />
            <span className="text-sm">
              <strong className={stats.mandatoryCount > 0 ? 'text-destructive' : 'text-green-600'}>{stats.mandatoryCount}</strong>
              {' '}Require Override
            </span>
          </div>
          
          {/* Using Target Volume Stat */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm">
              <strong className="text-blue-600">{stats.usingTargetCount}</strong>
              {' '}Using Target Volume
            </span>
          </div>
          
          {/* Expiring Soon (if any) */}
          {stats.expiringSoonCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm">
                <strong className="text-yellow-600">{stats.expiringSoonCount}</strong>
                {' '}Expiring Soon
              </span>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        {stats.mandatoryCount > 0 && (
          <Button variant="outline" size="sm">
            View Required
          </Button>
        )}
      </div>

      <EditableTable
        columns={columns}
        data={tableData}
        getRowId={(row) => row.id}
        storeNamespace="volume-override-settings"
      />
    </div>
  );
}
