import { useMemo, useState } from 'react';
import { getDaysInMonth } from 'date-fns';
import { EditableTable } from '@/components/editable-table/EditableTable';
import { createVolumeOverrideColumns, VolumeOverrideRow } from '@/config/volumeOverrideColumns';
import { useVolumeOverrides, useUpsertVolumeOverride, useDeleteVolumeOverride } from '@/hooks/useVolumeOverrides';
import { useVolumeOverrideConfig } from '@/hooks/useHistoricalVolumeAnalysis';
import { usePatientVolume } from '@/hooks/usePatientVolume';
import { Database, Lock } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { LogoLoader } from '@/components/ui/LogoLoader';
import { useRBAC } from '@/hooks/useRBAC';
import {
  isOverrideMandatory,
  calculateMaxOverrideExpiry,
  determineOverrideCategory,
} from '@/lib/volumeOverrideRules';

interface SettingsTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
}

export function SettingsTab({ selectedRegion, selectedMarket, selectedFacility }: SettingsTabProps) {
  const { data: overrides = [], isLoading: isLoadingOverrides } = useVolumeOverrides(selectedFacility);
  const { data: config } = useVolumeOverrideConfig();
  const upsertMutation = useUpsertVolumeOverride();
  const deleteMutation = useDeleteVolumeOverride();
  const { hasPermission } = useRBAC();
  const canManageOverrides = hasPermission('approvals.volume_override');

  // Patient volume API as primary data source
  const { data: patientVolumeData, isLoading: isLoadingPatientVolume } = usePatientVolume({
    region: selectedRegion,
    market: selectedMarket,
    facility: selectedFacility,
  });

  // Derive region/market from loaded data to avoid storing sentinel values
  const derivedRegion = useMemo(() => {
    return patientVolumeData?.[0]?.region || (selectedRegion !== 'all-regions' ? selectedRegion : '');
  }, [patientVolumeData, selectedRegion]);

  const derivedMarket = useMemo(() => {
    return patientVolumeData?.[0]?.market || (selectedMarket !== 'all-markets' ? selectedMarket : '');
  }, [patientVolumeData, selectedMarket]);

  // Pending overrides stored in memory (not saved to DB until expiration date is set)
  const [pendingOverrides, setPendingOverrides] = useState<Record<string, number>>({});
  // Track which department should auto-open its date picker
  const [autoOpenDatePicker, setAutoOpenDatePicker] = useState<string | null>(null);

  // Merge patient-volume data with overrides and pending values
  const tableData = useMemo((): VolumeOverrideRow[] => {
    if (!patientVolumeData?.length) return [];

    return patientVolumeData.map((record) => {
      const override = overrides.find((o) => o.department_id === record.department_id);
      const pendingVolume = pendingOverrides[record.department_id];

      const totalValidMonths = Number(record.total_valid_months ?? 0);
      const overrideMandatory = config ? isOverrideMandatory(totalValidMonths, config) : false;
      const maxAllowedExpiry = config ? calculateMaxOverrideExpiry(totalValidMonths, config) : null;
      const category = config ? determineOverrideCategory(totalValidMonths, config) : undefined;

      // Use override from API, or fallback to edited values from patient-volume record
      const overrideVolume = override?.override_volume
        ?? (record.edited_volume_override_value != null ? Number(record.edited_volume_override_value) : null);
      const expiryDate = override?.expiry_date
        ?? record.edited_expiry_date
        ?? null;

      // Parse last_12_month_volume_stats into historical_months_data
      let statsArray: Array<{ year_month: string; patient_volume_mthly: number; patient_volume_dly: number }> = [];
      const rawStats = record.last_12_month_volume_stats;
      if (rawStats) {
        try {
          statsArray = typeof rawStats === 'string' ? JSON.parse(rawStats) : rawStats;
        } catch { /* ignore parse errors */ }
      }

      const historicalMonthsData = statsArray.map(s => ({
        month: s.year_month,
        volume: Number(s.patient_volume_mthly ?? 0),
        daysInMonth: getDaysInMonth(new Date(s.year_month + '-01')),
      }));

      // Identify lowest 3 months by daily average
      const lowestThree = [...historicalMonthsData]
        .sort((a, b) => (a.volume / (a.daysInMonth || 1)) - (b.volume / (b.daysInMonth || 1)))
        .slice(0, 3)
        .map(m => m.month);

      // Spread & used_three_month_low
      const nMonthAvg = record.dly_avg_volume_12mth != null ? Number(record.dly_avg_volume_12mth) : null;
      const threeMonthLowAvg = record.dly_avg_volume_3mth_low != null ? Number(record.dly_avg_volume_3mth_low) : null;
      let spreadPct: number | null = null;
      let usedThreeMonthLow = false;
      if (nMonthAvg && threeMonthLowAvg && nMonthAvg > 0) {
        spreadPct = Math.round(((nMonthAvg - threeMonthLowAvg) / nMonthAvg) * 100);
        const threshold = config?.spread_threshold ?? 15;
        usedThreeMonthLow = spreadPct <= threshold;
      }

      return {
        id: override?.id || `dept-${record.department_id}`,
        department_id: record.department_id,
        department_name: record.department_description || record.concat_dept_name,
        override_volume: overrideVolume,
        pending_volume: pendingVolume ?? null,
        expiry_date: expiryDate,
        market: record.market || selectedMarket,
        facility_id: record.business_unit || selectedFacility,
        facility_name: record.business_unit_description || '',
        // Historical analysis from patient-volume API
        historical_months_count: totalValidMonths,
        historical_months_data: historicalMonthsData,
        target_volume: Number(record.target_volume ?? 0) || null,
        override_mandatory: overrideMandatory,
        max_allowed_expiry_date: maxAllowedExpiry,
        category,
        // 3-month low fields
        three_month_low_avg: threeMonthLowAvg,
        n_month_avg: nMonthAvg,
        spread_percentage: spreadPct,
        used_three_month_low: usedThreeMonthLow,
        lowest_three_months: lowestThree,
      };
    });
  }, [patientVolumeData, overrides, pendingOverrides, selectedMarket, selectedFacility, config]);

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

  // Step 1: Store volume in memory only (staged save)
  const handleSaveVolume = async (departmentId: string, volume: number | null) => {
    if (!canManageOverrides || !volume) return;
    setPendingOverrides(prev => ({ ...prev, [departmentId]: volume }));
    setAutoOpenDatePicker(departmentId);
  };

  const handleAutoOpenComplete = () => setAutoOpenDatePicker(null);

  // Step 2: Save both volume AND date to database together
  const handleSaveDate = async (departmentId: string, date: string | null) => {
    if (!canManageOverrides || !date) return;
    const row = tableData.find((r) => r.department_id === departmentId);
    if (!row) return;

    const volumeToSave = pendingOverrides[departmentId] ?? row.override_volume;
    if (!volumeToSave) return;

    await upsertMutation.mutateAsync({
      id: row.id.startsWith('dept-') ? undefined : row.id,
      market: row.market,
      facility_id: row.facility_id,
      facility_name: row.facility_name,
      department_id: row.department_id,
      department_name: row.department_name,
      override_volume: volumeToSave,
      expiry_date: date,
      region: derivedRegion,
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
    if (!row || row.id.startsWith('dept-')) return;
    await deleteMutation.mutateAsync({ id: row.id, facilityId: selectedFacility });
  };

  const columns = useMemo(
    () => createVolumeOverrideColumns(
      handleSaveVolume,
      handleSaveDate,
      handleDeleteOverride,
      config ?? undefined,
      autoOpenDatePicker,
      handleAutoOpenComplete
    ),
    [tableData, config, autoOpenDatePicker]
  );

  // Show message if no facility selected
  if (!selectedFacility || selectedFacility === 'all-facilities') {
    return (
      <div data-tour="volume-settings-empty" className="flex flex-col items-center justify-center h-96 text-center space-y-4">
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

  if (isLoadingPatientVolume || isLoadingOverrides) {
    return (
      <div className="flex items-center justify-center h-96">
        <LogoLoader size="lg" />
      </div>
    );
  }

  if (!patientVolumeData?.length) {
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
      {/* Consolidated Stats Banner */}
      <div data-tour="volume-settings-stats" className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stats.mandatoryCount > 0 ? 'bg-destructive' : 'bg-green-500'}`} />
            <span className="text-sm">
              <strong className={stats.mandatoryCount > 0 ? 'text-destructive' : 'text-green-600'}>{stats.mandatoryCount}</strong>
              {' '}Require Override
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm">
              <strong className="text-blue-600">{stats.usingTargetCount}</strong>
              {' '}Using Target Volume
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
        </div>
        {stats.mandatoryCount > 0 && (
          <Button variant="outline" size="sm">View Required</Button>
        )}
      </div>

      <div data-tour="volume-settings-table" data-tour-target="volume-settings-target" className="min-h-0 max-h-full overflow-hidden">
        <EditableTable
          columns={columns}
          data={tableData}
          getRowId={(row) => row.id}
          storeNamespace="volume-override-settings-v3"
        />
      </div>
    </div>
  );
}
