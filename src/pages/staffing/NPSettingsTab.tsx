import { useMemo, useState } from 'react';
import { EditableTable } from '@/components/editable-table/EditableTable';
import { createNPOverrideColumns, NPOverrideRow } from '@/config/npOverrideColumns';
import { useNPOverrides, useUpsertNPOverride, useDeleteNPOverride } from '@/hooks/useNPOverrides';
import { usePatientVolume, PatientVolumeRecord } from '@/hooks/usePatientVolume';
import { Database } from '@/lib/icons';
import { LogoLoader } from '@/components/ui/LogoLoader';
import { useRBAC } from '@/hooks/useRBAC';

interface NPSettingsTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
}

export function NPSettingsTab({ selectedRegion, selectedMarket, selectedFacility }: NPSettingsTabProps) {
  const { data: overrides = [], isLoading: isLoadingOverrides } = useNPOverrides(selectedFacility);
  const { data: patientVolumeData = [], isLoading: isLoadingPV } = usePatientVolume({
    region: selectedRegion,
    market: selectedMarket,
    facility: selectedFacility,
  });
  const upsertMutation = useUpsertNPOverride();
  const deleteMutation = useDeleteNPOverride();
  const { hasPermission } = useRBAC();
  const canManageOverrides = hasPermission('approvals.np_override');

  const [pendingOverrides, setPendingOverrides] = useState<Record<string, number>>({});
  const [autoOpenDatePicker, setAutoOpenDatePicker] = useState<string | null>(null);

  // Deduplicate departments from patient volume data
  const departments = useMemo(() => {
    const deptMap = new Map<string, PatientVolumeRecord>();
    for (const record of patientVolumeData) {
      if (!deptMap.has(record.department_id)) {
        deptMap.set(record.department_id, record);
      }
    }
    return Array.from(deptMap.values()).sort((a, b) =>
      (a.department_description || a.concat_dept_name).localeCompare(b.department_description || b.concat_dept_name)
    );
  }, [patientVolumeData]);

  // Derive facility name from patient volume data
  const facilityName = useMemo(() => {
    return patientVolumeData[0]?.business_unit_description || '';
  }, [patientVolumeData]);

  // Derive region from patient volume data
  const region = useMemo(() => {
    return patientVolumeData[0]?.region || selectedRegion || '';
  }, [patientVolumeData, selectedRegion]);

  // Merge departments with overrides and pending values
  const tableData = useMemo((): NPOverrideRow[] => {
    if (!departments.length) return [];

    return departments.map((dept) => {
      const override = overrides.find((o) => o.department_id === dept.department_id);
      const pendingVolume = pendingOverrides[dept.department_id];
      const maxExpiry = dept.max_expiry_date ? new Date(dept.max_expiry_date) : new Date(new Date().getFullYear() + 1, 5, 30);

      return {
        id: override?.id || `dept-${dept.department_id}`,
        department_id: dept.department_id,
        department_name: dept.department_description || dept.concat_dept_name,
        np_target_volume: 10,
        np_override_volume: override?.np_override_volume ?? null,
        pending_volume: pendingVolume ?? null,
        expiry_date: override?.expiry_date ?? null,
        max_expiry_date: maxExpiry,
        market: selectedMarket,
        facility_id: selectedFacility,
        facility_name: facilityName,
      };
    });
  }, [departments, overrides, selectedMarket, selectedFacility, facilityName, pendingOverrides]);

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

    const notSetCount = tableData.filter(row => !row.np_override_volume && row.pending_volume == null).length;

    return { activeCount, expiringSoonCount, notSetCount };
  }, [tableData]);

  // Step 1: Store volume in memory only (staged save)
  const handleSaveVolume = async (departmentId: string, volume: number | null) => {
    if (!canManageOverrides) return;
    if (!volume) return;

    setPendingOverrides(prev => ({ ...prev, [departmentId]: volume }));
    setAutoOpenDatePicker(departmentId);
  };

  const handleAutoOpenComplete = () => {
    setAutoOpenDatePicker(null);
  };

  // Step 2: Save both volume AND date to database together via PATCH upsert
  const handleSaveDate = async (departmentId: string, date: string | null) => {
    if (!canManageOverrides) return;
    if (!date) return;

    const row = tableData.find((r) => r.department_id === departmentId);
    if (!row) return;

    const volumeToSave = pendingOverrides[departmentId] ?? row.np_override_volume;
    if (!volumeToSave) return;

    await upsertMutation.mutateAsync({
      id: row.id.startsWith('dept-') ? undefined : row.id,
      market: row.market,
      facility_id: row.facility_id,
      facility_name: row.facility_name,
      department_id: row.department_id,
      department_name: row.department_name,
      np_override_volume: volumeToSave,
      expiry_date: date,
      region: region,
    });

    setPendingOverrides(prev => {
      const updated = { ...prev };
      delete updated[departmentId];
      return updated;
    });
  };

  const handleDeleteOverride = async (departmentId: string) => {
    if (!canManageOverrides) return;

    const row = tableData.find((r) => r.department_id === departmentId);
    if (!row) return;

    if (!row.id.startsWith('dept-')) {
      await deleteMutation.mutateAsync({
        id: row.id,
        facilityId: selectedFacility,
      });
    }
  };

  const columns = useMemo(
    () => createNPOverrideColumns(
      handleSaveVolume,
      handleSaveDate,
      handleDeleteOverride,
      autoOpenDatePicker,
      handleAutoOpenComplete
    ),
    [tableData, autoOpenDatePicker]
  );

  if (!selectedFacility || selectedFacility === 'all-facilities') {
    return (
      <div data-tour="np-settings-empty" className="flex flex-col items-center justify-center h-96 text-center space-y-4">
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

  if (isLoadingPV || isLoadingOverrides) {
    return (
      <div className="flex items-center justify-center h-96">
        <LogoLoader size="lg" />
      </div>
    );
  }

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
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <div data-tour="np-settings-stats" className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stats.activeCount > 0 ? 'bg-green-500' : 'bg-muted-foreground'}`} />
            <span className="text-sm">
              <strong className={stats.activeCount > 0 ? 'text-green-600' : 'text-muted-foreground'}>{stats.activeCount}</strong>
              {' '}Active
            </span>
          </div>
          {stats.expiringSoonCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm">
                <strong className="text-yellow-600">{stats.expiringSoonCount}</strong>
                {' '}Expiring Soon
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-sm">
              <strong className="text-muted-foreground">{stats.notSetCount}</strong>
              {' '}Not Set
            </span>
          </div>
        </div>
      </div>

      <div data-tour="np-settings-table" data-tour-override="np-settings-override" className="min-h-0 max-h-full overflow-hidden">
        <EditableTable
          columns={columns}
          data={tableData}
          getRowId={(row) => row.id}
          storeNamespace="np-override-settings-v3"
        />
      </div>
    </div>
  );
}
