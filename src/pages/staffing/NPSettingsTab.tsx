import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EditableTable } from '@/components/editable-table/EditableTable';
import { createNPOverrideColumns, NPOverrideRow } from '@/config/npOverrideColumns';
import { useNPOverrides, useUpsertNPOverride, useDeleteNPOverride } from '@/hooks/useNPOverrides';
import { useHistoricalVolumeAnalysis } from '@/hooks/useHistoricalVolumeAnalysis';
import { Database } from 'lucide-react';
import { LogoLoader } from '@/components/ui/LogoLoader';

interface NPSettingsTabProps {
  selectedMarket: string;
  selectedFacility: string;
}

// Helper function to get fiscal year end date (June 30th)
function getFiscalYearEndDate(): Date {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed (January = 0)
  
  // If we're past June 30, the fiscal year end is next year's June 30
  // If we're before or on June 30, it's this year's June 30
  const fiscalYearEnd = currentMonth >= 6 
    ? new Date(currentYear + 1, 5, 30) // June is month 5 (0-indexed)
    : new Date(currentYear, 5, 30);
  
  return fiscalYearEnd;
}

export function NPSettingsTab({ selectedMarket, selectedFacility }: NPSettingsTabProps) {
  const { data: overrides = [], isLoading: isLoadingOverrides } = useNPOverrides(selectedFacility);
  const { data: volumeAnalysis = [], isLoading: isLoadingAnalysis } = useHistoricalVolumeAnalysis();
  const upsertMutation = useUpsertNPOverride();
  const deleteMutation = useDeleteNPOverride();

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

  const fiscalYearEnd = useMemo(() => getFiscalYearEndDate(), []);

  // Merge departments with overrides and historical analysis (for target volume)
  const tableData = useMemo((): NPOverrideRow[] => {
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
        np_target_volume: analysis?.target_volume ?? null,
        np_override_volume: override?.np_override_volume ?? null,
        expiry_date: override?.expiry_date ?? null,
        max_expiry_date: fiscalYearEnd,
        market: selectedMarket,
        facility_id: selectedFacility,
        facility_name: facilityData?.facility_name || '',
      };
    });
  }, [departments, overrides, volumeAnalysis, selectedMarket, selectedFacility, facilityData, fiscalYearEnd]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeCount = tableData.filter(row => {
      if (!row.np_override_volume || !row.expiry_date) return false;
      const daysUntilExpiry = Math.ceil((new Date(row.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 7;
    }).length;
    
    const expiringSoonCount = tableData.filter(row => {
      if (!row.expiry_date || !row.np_override_volume) return false;
      const daysUntilExpiry = Math.ceil((new Date(row.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    }).length;
    
    const notSetCount = tableData.filter(row => !row.np_override_volume).length;

    return { activeCount, expiringSoonCount, notSetCount };
  }, [tableData]);

  const handleSaveVolume = async (departmentId: string, volume: number | null) => {
    const row = tableData.find((r) => r.department_id === departmentId);
    if (!row) return;

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
      np_override_volume: volume,
      expiry_date: row.expiry_date,
    });
  };

  const handleSaveDate = async (departmentId: string, date: string | null) => {
    const row = tableData.find((r) => r.department_id === departmentId);
    if (!row) return;

    if (!date) return;

    // Require volume
    if (!row.np_override_volume) {
      return;
    }

    await upsertMutation.mutateAsync({
      market: row.market,
      facility_id: row.facility_id,
      facility_name: row.facility_name,
      department_id: row.department_id,
      department_name: row.department_name,
      np_override_volume: row.np_override_volume,
      expiry_date: date,
    });
  };

  const columns = useMemo(
    () => createNPOverrideColumns(handleSaveVolume, handleSaveDate),
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
            Please select a specific facility from the filters above to view and manage NP override volumes for its departments.
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
      {/* Stats Banner */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-8">
          {/* Active Stat */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stats.activeCount > 0 ? 'bg-green-500' : 'bg-muted-foreground'}`} />
            <span className="text-sm">
              <strong className={stats.activeCount > 0 ? 'text-green-600' : 'text-muted-foreground'}>{stats.activeCount}</strong>
              {' '}Active
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
          
          {/* Not Set Stat */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-sm">
              <strong className="text-muted-foreground">{stats.notSetCount}</strong>
              {' '}Not Set
            </span>
          </div>
        </div>
      </div>

      <EditableTable
        columns={columns}
        data={tableData}
        getRowId={(row) => row.id}
        storeNamespace="np-override-settings-v2"
      />
    </div>
  );
}
